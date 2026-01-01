import { AnimatedSprite } from './AnimatedSprite.js';

const COLLISION_STEP_SIZE = 0.5;

export class Player extends AnimatedSprite {
    /**
     * Create a player character
     * @param {Object} config - Konfigurasi objek
     * @param {Object} config.position - {x, y} posisi player di canvas
     * @param {CanvasRenderingContext2D} config.ctx - Canvas context untuk draw spritenya
     * @param {CollisionBlock} config.collisionBlock - CollisionBlock instance untuk deteksi tabrakan
     * @param {number} config.gravity - Gravity acceleration constant
     * @param {number} config.jumpVelocity - Initial jump velocity
     * @param {string} config.imageSrc - Source image path
     * @param {number} config.frameRate - Jumlah gambar/frame di spritesheet
     * @param {number} config.scale - Scale factor untuk gambar
     * @param {Object} config.animations - Objek animasi dengan konfigurasi tiap state
     */
    constructor({ position, ctx, collisionBlock, gravity, jumpVelocity, imageSrc, frameRate, scale = 1, animations }) {
        super({ imageSrc, frameRate, scale })
        this.position = position
        this.velocity = { x: 0, y: 0 }
        this.width = 16;
        this.height = 24;
        this.onGround = false;
        this.ctx = ctx;
        this.collisionBlock = collisionBlock;
        this.gravity = gravity;
        this.jumpVelocity = jumpVelocity;
        this.animations = animations;
        this.facingDirection = 1;
        for (let key in this.animations) {
            const image = new Image();
            image.src = this.animations[key].imageSrc;
            this.animations[key].image = image;
        }
    }

    applyGravity() {
        this.velocity.y += this.gravity;
    }

    applyHorizontalVelocity() {
        this.position.x += this.velocity.x;
    }

    applyVerticalVelocity() {
        this.position.y += this.velocity.y;
    }

    updateHitbox() {
        this.hitbox = {
            position: {
                x: this.position.x + 22,
                y: this.position.y + 15,
            },
            width: 20,
            height: 50,
        }
    }

    updateAttackHitbox() {
        const attackRange = 40;

        if (this.facingDirection === 1) {
            this.attackHitbox = {
                position: {
                    x: this.hitbox.position.x + this.hitbox.width,
                    y: this.hitbox.position.y + 10,
                },
                width: attackRange,
                height: 30,
            }
        } else {
            this.attackHitbox = {
                position: {
                    x: this.hitbox.position.x - attackRange,
                    y: this.hitbox.position.y + 10,
                },
                width: attackRange,
                height: 30,
            }
        }
    }
    /**
     * Ngecek, deteksi, dan ngatasin logika tabrakan horizontal
     */
    checkHorizontalCollision() {
        if (this.velocity.x === 0) return;  // Skip jika tidak bergerak horizontal

        // Tentukan sisi mana yang dicek berdasarkan arah gerakan
        const checkX = this.velocity.x > 0
            ? this.hitbox.position.x + this.hitbox.width - 1  // Sisi kanan
            : this.hitbox.position.x;  // Sisi kiri

        // Scan sisi vertikal hitbox (skip 2px dari atas/bawah untuk gerakan lebih smooth)
        for (let y = 2; y < this.hitbox.height - 2; y++) {
            const checkY = this.hitbox.position.y + y;

            if (this.collisionBlock.isSolidPixel(Math.floor(checkX), Math.floor(checkY))) {
                this.position.x -= this.velocity.x;  // Batalkan gerakan yang menyebabkan tabrakan
                return;
            }
        }
    }
    /**
     * Ngecek, deteksi, dan ngatasin logika tabrakan vertical
     */
    checkCeilingCollision() {
        if (this.velocity.y >= 0) return;  // Hanya cek saat bergerak ke atas

        const headY = this.hitbox.position.y - 1;  // Cek 1px di atas kepala
        // Scan sisi horizontal atas (skip 2px dari kiri/kanan)
        for (let x = 2; x < this.hitbox.width - 2; x++) {
            const checkX = this.hitbox.position.x + x;
            if (this.collisionBlock.isSolidPixel(Math.floor(checkX), Math.floor(headY))) {
                this.position.y = Math.ceil(this.position.y);  // Snap ke langit-langit
                this.velocity.y = 0;  // Hentikan gerakan ke atas
                return;
            }
        }
    }
    /**
     * Ngecek dan deteksi kaki di tanah dan update status onGround
     * Menggunakan pendekatan pixel-perfect collision detection
     */
    checkGroundCollision() {
        if (this.velocity.y < 0) {  // Skip jika sedang lompat/bergerak ke atas
            this.onGround = false;
            return;
        }

        const footY = this.hitbox.position.y + this.hitbox.height - 1;  // Sisi bawah hitbox
        let hasCollision = false;

        // Cek apakah ada titik di sepanjang sisi bawah yang menyentuh tanah solid
        for (let x = 2; x < this.hitbox.width - 2; x++) {
            const checkX = this.hitbox.position.x + x;
            if (this.collisionBlock.isSolidPixel(Math.floor(checkX), Math.floor(footY))) {
                hasCollision = true;
                break;
            }
        }

        if (hasCollision) {
            // Naikkan posisi perlahan sampai tidak ada collision (landing smooth di slope)
            while (hasCollision) {
                this.position.y -= COLLISION_STEP_SIZE;  // Naik dengan step kecil
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
     * Mengganti state sprite animasi player
     * @param {string} key - Animation key (Idle, Run, Jump, Fall, Attack)
     */
    switchSprite(key) {
        if (this.image === this.animations[key].image || !this.loaded) { return; }

        this.currentFrame = 0;
        this.elapsedFrames = 0;

        this.image = this.animations[key].image;
        this.frameHold = this.animations[key].frameHold;
        this.frameRate = this.animations[key].frameRate;
        this.loop = this.animations[key].loop !== undefined ? this.animations[key].loop : true;

        if (this.animations[key].frameWidth) {
            this.frameWidth = this.animations[key].frameWidth;
        } else {
            this.frameWidth = this.image.width / this.frameRate;
        }

        if (this.image.complete && this.image.naturalWidth !== 0) {
            this.width = this.frameWidth;
            this.height = this.image.height;
        }
    }
    /**
     * Menggambar player di canvas dengan flip horizontal berdasarkan facingDirection
     */
    draw() {
        if (!this.image) { return; }

        const frameWidth = this.frameWidth || (this.image.width / this.frameRate);

        // Hitung bagian mana dari spritesheet yang akan digambar
        const cropbox = {
            position: {
                x: this.currentFrame * frameWidth,  // Offset ke frame saat ini
                y: 0
            },
            width: frameWidth,
            height: this.image.height
        }

        this.ctx.save();

        if (this.facingDirection === -1) {  // Menghadap kiri
            // Flip sprite secara horizontal menggunakan scale negatif
            this.ctx.translate(this.position.x + this.width, this.position.y);
            this.ctx.scale(-1, 1);  // Mirror pada sumbu X
            this.ctx.drawImage(
                this.image,
                cropbox.position.x,
                cropbox.position.y,
                cropbox.width,
                cropbox.height,
                0,  // Gambar di origin setelah transform
                0,
                this.width,
                this.height);
        } else {  // Menghadap kanan
            // Gambar normal tanpa flip
            this.ctx.drawImage(
                this.image,
                cropbox.position.x,
                cropbox.position.y,
                cropbox.width,
                cropbox.height,
                this.position.x,
                this.position.y,
                this.width,
                this.height);
        }

        this.ctx.restore();  // Restore transform original
    }
    /**
     * Update player state, collisions, dan render (looping setiap frame)
     */
    update() {
        this.updateHitbox();
        this.updateAttackHitbox();
        this.applyHorizontalVelocity();

        this.updateHitbox();
        this.updateAttackHitbox();
        this.checkHorizontalCollision();

        this.applyGravity();
        this.updateHitbox();

        this.applyVerticalVelocity();
        this.updateHitbox();

        this.checkCeilingCollision();
        this.updateHitbox();

        this.checkGroundCollision();
        this.updateHitbox();

        this.draw();
        this.updateFrame();
    }
}
