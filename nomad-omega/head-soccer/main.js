import { Game } from './src/game.js';
import { Menu } from './src/menu.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 1280;
canvas.height = 720;

let game = null;
let menu = new Menu(startGame);

function startGame(p1Config, p2Config) {
    game = new Game(canvas, ctx, p1Config, p2Config);
    document.getElementById('ui-overlay').style.display = 'block'; // Show UI
}

// Hide UI initially
document.getElementById('ui-overlay').style.display = 'none';

function gameLoop(timestamp) {
    if (menu.isActive) {
        menu.draw(ctx, canvas);
    } else if (game) {
        game.update(timestamp);
        game.draw();
    }
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
