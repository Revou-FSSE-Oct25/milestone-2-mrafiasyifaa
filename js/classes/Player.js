import { AnimatedSprite } from './AnimatedSprite.js';

export class Player extends AnimatedSprite{
    constructor({position, ctx, collisionBlock, gravity, jumpVelocity, imageSrc, frameRate, scale=1, animations}){
        super({imageSrc, frameRate, scale})
        this.position = position
        this.velocity = {x:0, y:0}
        this.width = 16;
        this.height = 24;
        this.onGround = false;
        this.ctx = ctx;
        this.collisionBlock = collisionBlock;
        this.gravity = gravity;
        this.jumpVelocity = jumpVelocity;
        this.animations = animations;
        this.facingDirection = 1;
        for (let key in this.animations){
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

    updateHitbox(){
        this.hitbox = {
            position: {
                x: this.position.x + 22, 
                y: this.position.y + 15,
            },
            width: 20,
            height: 50,
        }
    }

    updateAttackHitbox(){
        const attackRange = 40;
        
        if(this.facingDirection === 1) {
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

    checkHorizontalCollision() {
        if (this.velocity.x === 0) return;
        
        const checkX = this.velocity.x > 0 
            ? this.hitbox.position.x + this.hitbox.width - 1
            : this.hitbox.position.x;
        
        for (let y = 2; y < this.hitbox.height - 2; y++) {
            const checkY = this.hitbox.position.y + y;
            
            if (this.collisionBlock.isSolidPixel(Math.floor(checkX), Math.floor(checkY))) {
                this.position.x -= this.velocity.x;
                return;
            }
        }
    }

    checkCeilingCollision() {
        if (this.velocity.y >= 0) return;
        
        const headY = this.hitbox.position.y - 1;
        for (let x = 2; x < this.hitbox.width - 2; x++) {
            const checkX = this.hitbox.position.x + x;
            if (this.collisionBlock.isSolidPixel(Math.floor(checkX), Math.floor(headY))) {
                this.position.y = Math.ceil(this.position.y);
                this.velocity.y = 0;
                return;
            }
        }
    }

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
                this.position.y -= 0.5;
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

    switchSprite(key){
        if(this.image === this.animations[key].image || !this.loaded){return;}
        
        this.currentFrame = 0;
        this.elapsedFrames = 0;
        
        this.image = this.animations[key].image;
        this.frameHold = this.animations[key].frameHold;
        this.frameRate = this.animations[key].frameRate;
        this.loop = this.animations[key].loop !== undefined ? this.animations[key].loop : true;
        
        if(this.animations[key].frameWidth){
            this.frameWidth = this.animations[key].frameWidth;
        } else {
            this.frameWidth = this.image.width / this.frameRate;
        }
        
        if(this.image.complete && this.image.naturalWidth !== 0){
            this.width = this.frameWidth;
            this.height = this.image.height;
        }
    }

    draw(){
        if(!this.image){return;}

        const frameWidth = this.frameWidth || (this.image.width / this.frameRate);
        
        const cropbox = {
            position: {
                x: this.currentFrame * frameWidth, 
                y: 0},
            width: frameWidth,
            height: this.image.height
        }

        this.ctx.save();
        
        if (this.facingDirection === -1) {
            this.ctx.translate(this.position.x + this.width, this.position.y);
            this.ctx.scale(-1, 1);
            this.ctx.drawImage(
                this.image, 
                cropbox.position.x, 
                cropbox.position.y,
                cropbox.width,
                cropbox.height,
                0,
                0,
                this.width,
                this.height);
        } else {
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
        
        this.ctx.restore();
    }

    update(){
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

        // // DEBUGGING GAMBAR SPRITE
        // this.ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
        // this.ctx.fillRect(
        //     this.position.x, 
        //     this.position.y, 
        //     this.width, 
        //     this.height);
        
        // // DEBUGGING HITBOX
        // this.ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
        // this.ctx.fillRect(
        //     this.hitbox.position.x, 
        //     this.hitbox.position.y, 
        //     this.hitbox.width, 
        //     this.hitbox.height);
        
        // // DEBUGGING ATTACK HITBOX
        // if(this.isAttacking){
        //     this.ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
        //     this.ctx.fillRect(
        //         this.attackHitbox.position.x, 
        //         this.attackHitbox.position.y, 
        //         this.attackHitbox.width, 
        //         this.attackHitbox.height);
        // }
    }
}
