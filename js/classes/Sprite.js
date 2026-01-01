export class Sprite {
    /**
     * Membuat sprite
     * @param {Object} config - Konfigurasi objek
     * @param {Object} config.position - {x, y} posisi sprite di canvas
     * @param {string} config.imageSrc - Sumber gambar sprite
     * @param {CanvasRenderingContext2D} config.ctx - Canvas context untuk draw spritenya
     */
    constructor({ position, imageSrc, ctx }) {
        this.position = position
        this.image = new Image();
        this.image.src = imageSrc;
        this.ctx = ctx;
    }
    /**
     * Fungsi untuk menggambar sprite di canvas
    */
    draw() {
        if (!this.image) { return; }
        this.ctx.drawImage(this.image, this.position.x, this.position.y);
    }
    /**
     * Looping untuk update gambar sprite tiap frame
     */

    update() {
        this.draw();
    }
}
