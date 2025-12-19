export class CollisionBlock {
    constructor(mapWidth, mapHeight, collisionImgSrc) {
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;
        
        this.collisionImg = new Image();
        this.collisionImg.src = collisionImgSrc;
        
        this.collisionCanvas = document.createElement("canvas");
        this.collisionCtx = this.collisionCanvas.getContext("2d", { willReadFrequently: true });
        
        this.collisionCanvas.width = mapWidth;
        this.collisionCanvas.height = mapHeight;
        
        this.ready = false;
        
        this.collisionImg.onload = () => {
            this.collisionCtx.drawImage(this.collisionImg, 0, 0);
            this.ready = true;
        };
    }
    
    isSolidPixel(x, y) {
        if (!this.ready) return false;
        
        if (x < 0 || y < 0 || x >= this.mapWidth || y >= this.mapHeight) {
            return true;
        }
        
        const pixel = this.collisionCtx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
        return pixel[3] > 0;
    }
    
    isOnGround(hitbox) {
        const footY = hitbox.position.y + hitbox.height - 1;
        
        const feetX = [
            hitbox.position.x + 2,
            hitbox.position.x + hitbox.width / 2,
            hitbox.position.x + hitbox.width - 2,
        ];
        
        return feetX.some(x => this.isSolidPixel(x, footY));
    }
    
    isCeiling(hitbox) {
        const headY = hitbox.position.y - 1;
        
        const headX = [
            hitbox.position.x + 2,
            hitbox.position.x + hitbox.width / 2,
            hitbox.position.x + hitbox.width - 2,
        ];
        
        return headX.some(x => this.isSolidPixel(x, headY));
    }
}
