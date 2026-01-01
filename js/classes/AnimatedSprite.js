export class AnimatedSprite {
    /**
     * Membuat sprite dari spritesheet
     * @param {Object} config - Konfigurasi objek
     * @param {Object} config.position - {x, y} posisi sprite di canvas
     * @param {string} config.imageSrc - Sumber gambar sprite
     * @param {CanvasRenderingContext2D} config.ctx - Canvas context untuk draw spritenya
     * @param {number} config.frameRate - Jumlah frame di spritesheet
     * @param {number} config.frameHold - Jumlah frame game untuk menahan tiap frame animasi
     * @param {boolean} config.loop - Boolean untuk nge-loop animasi
     */
    constructor({ position, imageSrc, ctx, frameRate = 1, frameHold = 24, loop = true }) {
        this.position = position
        this.loaded = false
        this.image = new Image();
        this.image.onload = () => {
            this.width = this.image.width / this.frameRate
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
    /**
     * Fungsi untuk menggambar sprite di canvas
     */
    draw() {
        if (!this.image) { return; }

        // Hitung rectangle sumber dari spritesheet
        const cropbox = {
            position: {
                x: this.currentFrame * (this.image.width / this.frameRate),  // Offset horizontal untuk frame saat ini
                y: 0
            },
            width: this.image.width / this.frameRate,  // Lebar satu frame
            height: this.image.height
        }

        // Gambar bagian yang di-crop dari spritesheet ke canvas
        this.ctx.drawImage(
            this.image,
            cropbox.position.x,  // Source X (frame mana)
            cropbox.position.y,  // Source Y (selalu 0 untuk spritesheet horizontal)
            cropbox.width,       // Source width
            cropbox.height,      // Source height
            this.position.x,     // Destination X
            this.position.y,     // Destination Y
            this.width,          // Destination width
            this.height,);       // Destination height
    }
    /**
     * Looping untuk update gambar sprite tiap frame
     */
    update() {
        this.updateFrame();
        this.draw();
    }
    /**
    * Update frame animasi berdasarkan frameHold dan loop
    */
    updateFrame() {
        this.elapsedFrames++

        // Hanya maju ke frame berikutnya jika waktu yang cukup telah berlalu (frameHold)
        if (this.elapsedFrames >= this.frameHold) {
            this.elapsedFrames = 0  // Reset counter

            if (this.currentFrame < this.frameRate - 1) {
                this.currentFrame++  // Lanjut ke frame berikutnya
            } else if (this.loop) {
                this.currentFrame = 0  // Loop kembali ke frame pertama
            }
            // Jika tidak loop dan di frame terakhir, tetap di frame terakhir
        }
    }
}
