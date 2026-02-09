import { CHARACTERS } from './config.js';

export class Menu {
    constructor(onStartGame) {
        this.onStartGame = onStartGame;
        this.p1Index = 0;
        this.p2Index = 1;
        this.isActive = true;

        // Bind Input
        this.handleInput = this.handleInput.bind(this);
        window.addEventListener('keydown', this.handleInput);
    }

    handleInput(e) {
        if (!this.isActive) return;

        // P1 Controls (WASD)
        if (e.key === 'a' || e.key === 'A') this.p1Index = (this.p1Index - 1 + CHARACTERS.length) % CHARACTERS.length;
        if (e.key === 'd' || e.key === 'D') this.p1Index = (this.p1Index + 1) % CHARACTERS.length;

        // P2 Controls (Arrows)
        if (e.key === 'ArrowLeft') this.p2Index = (this.p2Index - 1 + CHARACTERS.length) % CHARACTERS.length;
        if (e.key === 'ArrowRight') this.p2Index = (this.p2Index + 1) % CHARACTERS.length;

        // Start Game
        if (e.key === 'Enter' || e.key === ' ') {
            this.isActive = false;
            window.removeEventListener('keydown', this.handleInput);
            this.onStartGame(CHARACTERS[this.p1Index], CHARACTERS[this.p2Index]);
        }
    }

    draw(ctx, canvas) {
        if (!this.isActive) return;

        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'white';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText("SELECT YOUR PLAYER", canvas.width / 2, 100);

        ctx.font = '20px Arial';
        ctx.fillText("P1: A/D to Select, Space to Start", canvas.width / 4, 600);
        ctx.fillText("P2: Arrows to Select, Enter to Start", 3 * canvas.width / 4, 600);

        // Draw Selections
        this.drawCharacterPreview(ctx, canvas.width / 4, 300, CHARACTERS[this.p1Index], "Player 1");
        this.drawCharacterPreview(ctx, 3 * canvas.width / 4, 300, CHARACTERS[this.p2Index], "Player 2");

        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 30px Arial';
        ctx.fillText("VS", canvas.width / 2, 300);
    }

    drawCharacterPreview(ctx, x, y, config, label) {
        // Name
        ctx.fillStyle = 'white';
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(label, x, y - 120);

        ctx.fillStyle = '#AAA';
        ctx.font = '20px Arial';
        ctx.fillText(config.name, x, y - 90);
        ctx.fillText(config.team, x, y - 65);

        // Draw Jersey Preview
        const w = 80;
        const h = 120;

        if (config.colors.length === 3) {
            const sh = h / 3;
            ctx.fillStyle = config.colors[0];
            ctx.fillRect(x - w / 2, y, w, sh);
            ctx.fillStyle = config.colors[1];
            ctx.fillRect(x - w / 2, y + sh, w, sh);
            ctx.fillStyle = config.colors[2];
            ctx.fillRect(x - w / 2, y + sh * 2, w, sh);
        } else {
            ctx.fillStyle = config.colors[0];
            ctx.fillRect(x - w / 2, y, w, h);
            if (config.colors.length > 1) {
                ctx.fillStyle = config.colors[1];
                ctx.fillRect(x - w / 2 + 25, y, 30, h);
            }
        }
    }
}
