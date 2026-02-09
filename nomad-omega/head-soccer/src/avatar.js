export class Avatar {
    constructor(x, y, characterConfig, controls) {
        this.x = x;
        this.y = y;
        this.width = 60;
        this.height = 100;
        this.config = characterConfig;
        this.colors = characterConfig.colors;
        this.controls = controls;

        this.vx = 0;
        this.vy = 0;
        this.isGrounded = false;

        this.expression = 'IDLE';

        this.image = new Image();
        this.image.src = `assets/faces/face${characterConfig.id}.png`;
        this.imageLoaded = false;
        this.image.onload = () => this.imageLoaded = true;

        this.winPhrases = ["Sikdim nəslini", "Varyoxunu atdım bu golu"];
        this.losePhrases = ["Peysər çıxdım", "var-yoxum getdi"];
        this.currentPhrase = "";
    }

    setExpression(expr) {
        this.expression = expr;
        if (expr === 'WIN') {
            this.currentPhrase = this.winPhrases[Math.floor(Math.random() * this.winPhrases.length)];
        } else if (expr === 'LOSE') {
            this.currentPhrase = this.losePhrases[Math.floor(Math.random() * this.losePhrases.length)];
        } else {
            this.currentPhrase = "";
        }
    }

    update(dt, physics) {
        if (this.controls.left) this.vx -= 50;
        if (this.controls.right) this.vx += 50;

        if (this.controls.jump && this.isGrounded) {
            this.vy = -800;
            this.isGrounded = false;
        }

        if (this.controls.kick) {
            this.expression = 'KICK';
        } else if (this.expression === 'KICK' && !this.controls.kick) {
            if (this.expression !== 'WIN' && this.expression !== 'LOSE') this.expression = 'IDLE';
        }

        physics.applyGravity(this, dt);
    }

    draw(ctx) {
        // Draw Jersey
        const bodyY = this.y + 40;
        const bodyH = this.height - 40;

        if (this.colors.length === 3) {
            // Tri-color (Flag style for Naile)
            const h = bodyH / 3;
            ctx.fillStyle = this.colors[0];
            ctx.fillRect(this.x, bodyY, this.width, h);
            ctx.fillStyle = this.colors[1];
            ctx.fillRect(this.x, bodyY + h, this.width, h);
            ctx.fillStyle = this.colors[2];
            ctx.fillRect(this.x, bodyY + h * 2, this.width, h);
        } else if (this.colors.length === 2) {
            // Striped vertical
            ctx.fillStyle = this.colors[0];
            ctx.fillRect(this.x, bodyY, this.width, bodyH);
            ctx.fillStyle = this.colors[1];
            ctx.fillRect(this.x + 20, bodyY, 20, bodyH);
        } else {
            // Solid
            ctx.fillStyle = this.colors[0];
            ctx.fillRect(this.x, bodyY, this.width, bodyH);
        }

        // Head
        ctx.beginPath();
        const headX = this.x + this.width / 2;
        const headY = this.y + 20;
        ctx.arc(headX, headY, 40, 0, Math.PI * 2);
        ctx.fill(); // Neck filler

        // Face rendering
        if (this.imageLoaded) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(headX, headY, 40, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(this.image, headX - 40, headY - 40, 80, 80);
            ctx.restore();

            this.drawEmotions(ctx, headX, headY);

            // Draw Phrase
            if (this.currentPhrase) this.drawPhrase(ctx, headX, headY);

        } else {
            this.drawNoImageFace(ctx, headX, headY);
        }

        // Shoe 
        ctx.fillStyle = 'black';
        ctx.fillRect(this.x + (this.vx > 0 ? 10 : -10), this.y + this.height - 10, 20, 10);
    }

    drawPhrase(ctx, x, y) {
        ctx.save();
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        const textWidth = ctx.measureText(this.currentPhrase).width;

        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        const bubbleX = x;
        const bubbleY = y - 60;

        ctx.beginPath();
        ctx.roundRect(bubbleX - textWidth / 2 - 10, bubbleY - 25, textWidth + 20, 35, 10);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = 'black';
        ctx.fillText(this.currentPhrase, bubbleX, bubbleY);
        ctx.restore();
    }

    drawEmotions(ctx, x, y) {
        if (this.expression === 'WIN') {
            ctx.font = '30px Arial';
            ctx.fillText('😎', x - 15, y + 10 + 20); // Lowered slightly
        } else if (this.expression === 'LOSE') {
            ctx.font = '30px Arial';
            ctx.fillText('😢', x - 15, y + 10 + 20);
        }
    }

    drawNoImageFace(ctx, headX, headY) {
        ctx.fillStyle = 'white';
        const eyeOffset = this.vx > 0 ? 5 : (this.vx < 0 ? -5 : 0);
        ctx.fillRect(headX - 20 + eyeOffset, headY - 10, 15, 15);
        ctx.fillRect(headX + 5 + eyeOffset, headY - 10, 15, 15);

        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        ctx.beginPath();
        if (this.expression === 'WIN') {
            ctx.arc(headX, headY + 15, 10, 0, Math.PI, false);
        } else if (this.expression === 'LOSE') {
            ctx.arc(headX, headY + 25, 10, 0, Math.PI, true);
        } else {
            ctx.moveTo(headX - 10, headY + 20);
            ctx.lineTo(headX + 10, headY + 20);
        }
        ctx.stroke();
    }
}
