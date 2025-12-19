export class AnimatedSprite{
    constructor({position, imageSrc, ctx, frameRate = 1, frameHold = 24, loop = true}){
        this.position = position
        this.loaded = false
        this.image = new Image();
        this.image.onload = () => {
            this.width = this.image.width/this.frameRate
            this.height = this.image.height
            this.loaded = true
        }
        this.image.src = imageSrc;
        this.ctx = ctx;

        this.frameRate = frameRate
        this.frameHold = frameHold
        this.currentFrame = 0
        this.elapsedFrames = 0
        this.loop = loop
    }

    draw(){
        if(!this.image){return;}

        const cropbox = {
            position: {
                x: this.currentFrame * (this.image.width / this.frameRate), 
                y: 0},
            width: this.image.width / this.frameRate,
            height: this.image.height
        }

        this.ctx.drawImage(
            this.image, 
            cropbox.position.x, 
            cropbox.position.y,
            cropbox.width,
            cropbox.height,
            this.position.x,
            this.position.y,
            this.width,
            this.height,);
    }

    update(){
        this.updateFrame();
        this.draw();
    }

    updateFrame(){
        this.elapsedFrames++
        
        if(this.elapsedFrames >= this.frameHold){
            this.elapsedFrames = 0
            
            if(this.currentFrame < this.frameRate - 1){
                this.currentFrame++
            }else if(this.loop){
                this.currentFrame = 0
            }
            // If loop is false, stay at last frame
        }
    }
}
