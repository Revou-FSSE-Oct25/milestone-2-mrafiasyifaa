export class Sprite{
    constructor({position, imageSrc, ctx}){
        this.position = position
        this.image = new Image();
        this.image.src = imageSrc;
        this.ctx = ctx;
    }

    draw(){
        if(!this.image){return;}
        this.ctx.drawImage(this.image, this.position.x, this.position.y);
    }

    update(){
        this.draw();
    }
}
