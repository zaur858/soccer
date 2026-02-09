export class Physics {
    constructor() {
        this.gravity = 1500;
        this.friction = 0.85;
        this.groundY = 580;
        this.bounce = 0.7; // Bounciness of the ball
    }

    applyGravity(entity, dt) {
        entity.vy += this.gravity * dt;
        entity.y += entity.vy * dt;
        entity.x += entity.vx * dt;

        // Ground collision
        if (entity.y + entity.height > this.groundY) {
            entity.y = this.groundY - entity.height;
            entity.vy = 0;
            entity.isGrounded = true;
        } else {
            entity.isGrounded = false;
        }

        // Wall collision
        if (entity.x < 0) {
            entity.x = 0;
            entity.vx = -entity.vx * 0.5;
        }
        if (entity.x + entity.width > 1280) {
            entity.x = 1280 - entity.width;
            entity.vx = -entity.vx * 0.5;
        }

        entity.vx *= this.friction;
    }

    applyBallPhysics(ball, dt) {
        ball.vy += this.gravity * dt;
        ball.y += ball.vy * dt;
        ball.x += ball.vx * dt;

        // Ground collision
        if (ball.y + ball.radius > this.groundY) {
            ball.y = this.groundY - ball.radius;
            ball.vy = -ball.vy * this.bounce;
        }

        // Ceiling collision
        if (ball.y - ball.radius < 0) {
            ball.y = ball.radius;
            ball.vy = -ball.vy * this.bounce;
        }

        // Wall & Goal Collision (Simplified: bounce off walls unless in goal area)
        if (ball.x - ball.radius < 0) {
            ball.x = ball.radius;
            ball.vx = -ball.vx * this.bounce;
        }
        if (ball.x + ball.radius > 1280) {
            ball.x = 1280 - ball.radius;
            ball.vx = -ball.vx * this.bounce;
        }

        ball.vx *= (this.friction + 0.14); // Ball rolls better than players
    }

    static checkCollision(rect1, rect2) {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    }

    static checkCircleRectCollision(circle, rect) {
        // Find the closest point on the rectangle to the center of the circle
        let testX = circle.x;
        let testY = circle.y;

        if (circle.x < rect.x) testX = rect.x;
        else if (circle.x > rect.x + rect.width) testX = rect.x + rect.width;

        if (circle.y < rect.y) testY = rect.y;
        else if (circle.y > rect.y + rect.height) testY = rect.y + rect.height;

        const distX = circle.x - testX;
        const distY = circle.y - testY;
        const distance = Math.sqrt((distX * distX) + (distY * distY));

        return {
            colliding: distance <= circle.radius,
            distX: distX,
            distY: distY,
            distance: distance
        };
    }

    static resolveBallPlayerCollision(ball, player) {
        const collision = Physics.checkCircleRectCollision(ball, player);
        if (collision.colliding) {
            // Calculate normal
            let nx = collision.distX / collision.distance;
            let ny = collision.distY / collision.distance;

            // Normalize for corner cases where distance is 0
            if (collision.distance === 0) {
                nx = 0; ny = -1;
            }

            // Push ball out
            const overlap = ball.radius - collision.distance;
            ball.x += nx * overlap;
            ball.y += ny * overlap;

            // Reflect velocity (perfect elastic collision approximation for simplicity + added kick force)
            // We transfer some of the player's velocity to the ball
            const force = 10;
            ball.vx = (ball.vx * -1) + (player.vx * 0.5) + (nx * force);
            ball.vy = (ball.vy * -1) + (player.vy * 0.5) + (ny * force);

            // Cap max speed
            const maxSpeed = 1000;
            if (Math.abs(ball.vx) > maxSpeed) ball.vx = Math.sign(ball.vx) * maxSpeed;
            if (Math.abs(ball.vy) > maxSpeed) ball.vy = Math.sign(ball.vy) * maxSpeed;
        }
    }
}
