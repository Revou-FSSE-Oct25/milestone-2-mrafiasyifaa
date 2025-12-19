import { AnimatedSprite } from './AnimatedSprite.js';

export class Mob extends AnimatedSprite{
    constructor({position, ctx, imageSrc, frameRate, frameHold, loop = true, collisionBlock, gravity, animations}){;
        super({position, imageSrc, ctx, frameRate, frameHold, loop})
        this.position = position
        this.velocity = {x: 0, y: 0}
        this.ctx = ctx;
        this.collisionBlock = collisionBlock;
        this.gravity = gravity;
        this.onGround = false;
        this.animations = animations;
        this.isHit = false;
        this.loaded = true;
        
        for (let key in this.animations){
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

    updateHitbox(){
        this.hitbox = {
            position: {
                x: this.position.x + 8,
                y: this.position.y + 8,
            },
            width: 32,
            height: 24,
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
        
        if(this.image.complete && this.image.naturalWidth !== 0){
            this.width = this.image.width / this.frameRate;
            this.height = this.image.height;
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

    update(){
        this.updateHitbox();
        
        this.applyGravity();
        this.applyVerticalVelocity();
        this.updateHitbox();
        this.checkGroundCollision();
        this.updateHitbox();
        
        this.draw();
        this.updateFrame();
        
        // // DEBUG: Draw hitbox
        // this.ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
        // this.ctx.fillRect(
        //     this.hitbox.position.x,
        //     this.hitbox.position.y,
        //     this.hitbox.width,
        //     this.hitbox.height
        // );
    }
}
