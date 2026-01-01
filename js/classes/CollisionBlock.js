export class CollisionBlock {
    /**
     * Membuat collision block dari image assets/map/collision.png
     * @param {number} mapWidth - Map width in pixels
     * @param {number} mapHeight - Map height in pixels
     * @param {string} collisionImgSrc - Source path for collision image
     */
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
    /**
     * Ngecek jika pixel di (x, y) adalah solid (bagian dari collision block)
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {boolean} True if pixel is solid or out of bounds
     */
    isSolidPixel(x, y) {
        if (!this.ready) return false;

        if (x < 0 || y < 0 || x >= this.mapWidth || y >= this.mapHeight) {
            return true;
        }

        const pixel = this.collisionCtx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
        return pixel[3] > 0;
    }
    /**
     * Ngecek jika hitbox menyentuh tanah
     * @param {Object} hitbox - Hitbox dengan posisi dan dimensi
     * @returns {boolean} True if any foot point is on solid ground
     */
    isOnGround(hitbox) {
        const footY = hitbox.position.y + hitbox.height - 1;

        const feetX = [
            hitbox.position.x + 2,
            hitbox.position.x + hitbox.width / 2,
            hitbox.position.x + hitbox.width - 2,
        ];

        return feetX.some(x => this.isSolidPixel(x, footY));
    }
    /**
     * Ngecek jika hitbox menyentuh langit-langit
     * @param {Object} hitbox - Hitbox dengan posisi dan dimensi
     * @returns {boolean} True if head is touching solid ceiling
     */
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
