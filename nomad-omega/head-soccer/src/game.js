import { Physics } from './physics.js';
import { Avatar } from './avatar.js';

export class Game {
    constructor(canvas, ctx, p1Config, p2Config) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.lastTime = 0;

        this.state = 'PLAYING';
        this.scoreP1 = 0;
        this.scoreP2 = 0;
        this.timer = 60;
        this.physics = new Physics();

        // Input State
        this.keys = {};
        window.addEventListener('keydown', (e) => this.keys[e.key] = true);
        window.addEventListener('keyup', (e) => this.keys[e.key] = false);

        // Initialize entities
        this.p1 = new Avatar(200, 500, p1Config, {
            get left() { return window.game.keys['a'] || window.game.keys['A']; },
            get right() { return window.game.keys['d'] || window.game.keys['D']; },
            get jump() { return window.game.keys['w'] || window.game.keys['W']; },
            get kick() { return window.game.keys[' ']; }
        });

        this.p2 = new Avatar(1000, 500, p2Config, {
            get left() { return window.game.keys['ArrowLeft']; },
            get right() { return window.game.keys['ArrowRight']; },
            get jump() { return window.game.keys['ArrowUp']; },
            get kick() { return window.game.keys['Enter']; }
        });

        this.ball = { x: 640, y: 300, vx: 0, vy: 0, radius: 25, color: 'white' };

        // Hack to access keys in getters
        window.game = this;
    }

    update(timestamp) {
        if (!this.lastTime) this.lastTime = timestamp;
        const deltaTime = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        // Cap deltaTime to prevent huge jumps logic
        const dt = Math.min(deltaTime, 0.05);

        if (this.state === 'PLAYING') {
            this.timer -= dt;
            if (this.timer <= 0) this.endGame();

            // Update Entities
            this.p1.update(dt, this.physics);
            this.p2.update(dt, this.physics);

            // Ball Physics
            this.physics.applyBallPhysics(this.ball, dt);

            // Collisions
            Physics.resolveBallPlayerCollision(this.ball, this.p1);
            Physics.resolveBallPlayerCollision(this.ball, this.p2);

            // Goal Check
            this.checkGoal();
        }

        this.updateUI();
    }

    checkGoal() {
        // Simple goal check
        if (this.ball.x < 50 && this.ball.y > 380) { // Left Goal -> Player 2 Scored
            this.scoreP2++;
            this.p2.setExpression('WIN');
            this.p1.setExpression('LOSE');
            this.resetPositions('2');
        } else if (this.ball.x > 1230 && this.ball.y > 380) { // Right Goal -> Player 1 Scored
            this.scoreP1++;
            this.p1.setExpression('WIN');
            this.p2.setExpression('LOSE');
            this.resetPositions('1');
        }
    }

    resetPositions(scorer) {
        this.state = 'GOAL';
        this.showGoalMessage(scorer);

        setTimeout(() => {
            this.p1.x = 200; this.p1.y = 500; this.p1.vx = 0; this.p1.vy = 0;
            this.p1.setExpression('IDLE');

            this.p2.x = 1000; this.p2.y = 500; this.p2.vx = 0; this.p2.vy = 0;
            this.p2.setExpression('IDLE');

            this.ball.x = 640; this.ball.y = 200; this.ball.vx = 0; this.ball.vy = 0;
            this.state = 'PLAYING';
            this.hideGoalMessage();
        }, 2000);
    }

    updateUI() {
        document.getElementById('score-p1').innerText = this.scoreP1;
        document.getElementById('score-p2').innerText = this.scoreP2;
        if (this.timer > 0) document.getElementById('timer').innerText = Math.ceil(this.timer);
    }

    showGoalMessage(scorer) {
        const msg = document.getElementById('game-message');
        msg.innerText = `GOAL! P${scorer}`;
        msg.classList.remove('hidden');
    }

    hideGoalMessage() {
        document.getElementById('game-message').classList.add('hidden');
    }

    endGame() {
        this.state = 'GAME_OVER';
        const msg = document.getElementById('game-message');
        msg.innerText = this.scoreP1 > this.scoreP2 ? "PLAYER 1 WINS!" : (this.scoreP2 > this.scoreP1 ? "PLAYER 2 WINS!" : "DRAW!");
        msg.classList.remove('hidden');
    }

    draw() {
        // Clear screen
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw Stadium / Fans (Simple dots for now)
        this.drawFans();

        // Draw Ground
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.fillRect(0, 580, 1280, 140);
        // Grass details
        this.ctx.fillStyle = '#388E3C';
        this.ctx.fillRect(0, 580, 1280, 20);

        // Draw Goals
        this.ctx.lineWidth = 10;
        this.ctx.strokeStyle = '#DDD'; // Post color

        // Left Goal
        this.ctx.beginPath();
        this.ctx.moveTo(50, 380);
        this.ctx.lineTo(150, 380);
        this.ctx.lineTo(150, 580);
        this.ctx.stroke();
        // Net
        this.ctx.globalAlpha = 0.3;
        this.ctx.fillStyle = '#EEE';
        this.ctx.fillRect(50, 380, 100, 200);
        this.ctx.globalAlpha = 1.0;

        // Right Goal
        this.ctx.beginPath();
        this.ctx.moveTo(1230, 380);
        this.ctx.lineTo(1130, 380);
        this.ctx.lineTo(1130, 580);
        this.ctx.stroke();
        // Net
        this.ctx.globalAlpha = 0.3;
        this.ctx.fillRect(1130, 380, 100, 200);
        this.ctx.globalAlpha = 1.0;

        // Draw Entities
        this.p1.draw(this.ctx);
        this.p2.draw(this.ctx);

        // Draw Ball
        this.drawBall();
    }

    drawFans() {
        this.ctx.fillStyle = '#555';
        for (let i = 0; i < 100; i++) {
            this.ctx.fillRect(Math.random() * 1280, 100 + Math.random() * 200, 5, 5);
        }
    }

    drawBall() {
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = this.ball.color;
        this.ctx.fill();
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = 'black';
        this.ctx.stroke();
        // Shine
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x - 5, this.ball.y - 5, 5, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255,255,255,0.5)';
        this.ctx.fill();
    }
}
