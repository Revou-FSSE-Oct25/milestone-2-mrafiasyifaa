import { AnimatedSprite } from './AnimatedSprite.js';

const COLLISION_STEP_SIZE = 0.5;

export class Mob extends AnimatedSprite {
    /**
     * Gambar mob/monster dengan animasi dan deteksi tabrakan
     * @param {Object} config - Konfigurasi objek
     * @param {Object} config.position - {x, y} posisi mob di canvas
     * @param {CanvasRenderingContext2D} config.ctx - Canvas context untuk draw spritenya
     * @param {string} config.imageSrc - Source image path
     * @param {number} config.frameRate - Jumlah gambar/frame di spritesheet
     * @param {number} config.frameHold - Jumlah frame game untuk menahan tiap frame animasi
     * @param {boolean} config.loop - Boolean untuk nge-loop animasi
     * @param {CollisionBlock} config.collisionBlock - CollisionBlock instance untuk deteksi tabrakan
     * @param {number} config.gravity - Gravity acceleration constant
     * @param {Object} config.animations - Objek animasi dengan konfigurasi tiap state
     */
    constructor({ position, ctx, imageSrc, frameRate, frameHold, loop = true, collisionBlock, gravity, animations }) {
        super({ position, imageSrc, ctx, frameRate, frameHold, loop })
        this.position = position
        this.velocity = { x: 0, y: 0 }
        this.ctx = ctx;
        this.collisionBlock = collisionBlock;
        this.gravity = gravity;
        this.onGround = false;
        this.animations = animations;
        this.isHit = false;
        this.loaded = true;

        for (let key in this.animations) {
            const image = new Image();
            image.src = this.animations[key].imageSrc;
            this.animations[key].image = image;
        }

        this.hitbox = {
            position: {
                x: this.position.x + 8,
                y: this.position.y + 8,
            },
            width: 32,
            height: 24,
        }
    }

    applyGravity() {
        this.velocity.y += this.gravity;
    }

    applyVerticalVelocity() {
        this.position.y += this.velocity.y;
    }

    updateHitbox() {
        this.hitbox = {
            position: {
                x: this.position.x + 8,
                y: this.position.y + 8,
            },
            width: 32,
            height: 24,
        }
    }
    /**
     * Mengganti state sprite animasi mob
     * @param {string} key - Animation key (Idle, Hit, etc.)
     */
    switchSprite(key) {
        if (this.image === this.animations[key].image || !this.loaded) { return; }

        this.currentFrame = 0;
        this.elapsedFrames = 0;

        this.image = this.animations[key].image;
        this.frameHold = this.animations[key].frameHold;
        this.frameRate = this.animations[key].frameRate;
        this.loop = this.animations[key].loop !== undefined ? this.animations[key].loop : true;

        if (this.image.complete && this.image.naturalWidth !== 0) {
            this.width = this.image.width / this.frameRate;
            this.height = this.image.height;
        }
    }
    /**
     * Ngecek dan deteksi kaki di tanah dan update status onGround
     * Menggunakan pendekatan pixel-perfect collision detection
     */
    checkGroundCollision() {
        if (this.velocity.y < 0) {
            this.onGround = false;
            return;
        }

        const footY = this.hitbox.position.y + this.hitbox.height - 1;
        let hasCollision = false;

        for (let x = 2; x < this.hitbox.width - 2; x++) {
            const checkX = this.hitbox.position.x + x;
            if (this.collisionBlock.isSolidPixel(Math.floor(checkX), Math.floor(footY))) {
                hasCollision = true;
                break;
            }
        }

        if (hasCollision) {
            while (hasCollision) {
                this.position.y -= COLLISION_STEP_SIZE;
                this.updateHitbox();

                const newFootY = this.hitbox.position.y + this.hitbox.height - 1;
                hasCollision = false;

                for (let x = 2; x < this.hitbox.width - 2; x++) {
                    const checkX = this.hitbox.position.x + x;
                    if (this.collisionBlock.isSolidPixel(Math.floor(checkX), Math.floor(newFootY))) {
                        hasCollision = true;
                        break;
                    }
                }
            }

            this.velocity.y = 0;
            this.onGround = true;
        } else {
            this.onGround = false;
        }
    }
    /**
     * Update player state, collisions, dan render (looping setiap frame)
     */
    update() {
        this.updateHitbox();

        this.applyGravity();
        this.applyVerticalVelocity();
        this.updateHitbox();
        this.checkGroundCollision();
        this.updateHitbox();

        this.draw();
        this.updateFrame();
    }
}
