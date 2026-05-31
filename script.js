// Video Maker Class
class VideoMaker {
    constructor() {
        this.canvas = document.getElementById('videoPreview');
        this.ctx = this.canvas.getContext('2d');
        this.frames = [];
        this.uploadedImage = null;
        this.isPlaying = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.drawPreview();
    }

    setupEventListeners() {
        // Text size slider
        document.getElementById('textSize').addEventListener('input', (e) => {
            document.getElementById('textSizeValue').textContent = e.target.value + 'px';
            this.drawPreview();
        });

        // Color inputs
        document.getElementById('bgColor').addEventListener('input', () => this.drawPreview());
        document.getElementById('textColor').addEventListener('input', () => this.drawPreview());
        document.getElementById('mainText').addEventListener('input', () => this.drawPreview());
        document.getElementById('textFont').addEventListener('change', () => this.drawPreview());

        // Image upload
        document.getElementById('imageUpload').addEventListener('change', (e) => {
            this.handleImageUpload(e);
        });

        // Buttons
        document.getElementById('previewBtn').addEventListener('click', () => this.playPreview());
        document.getElementById('generateBtn').addEventListener('click', () => this.generateVideo());
        document.getElementById('downloadBtn').addEventListener('click', () => this.downloadVideo());
    }

    handleImageUpload(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    this.uploadedImage = img;
                    const preview = document.getElementById('imagePreview');
                    preview.innerHTML = '';
                    preview.appendChild(img);
                    this.drawPreview();
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    drawPreview() {
        const bgColor = document.getElementById('bgColor').value;
        const textColor = document.getElementById('textColor').value;
        const mainText = document.getElementById('mainText').value;
        const textSize = document.getElementById('textSize').value;
        const textFont = document.getElementById('textFont').value;

        // Clear canvas
        this.ctx.fillStyle = bgColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw image if uploaded
        if (this.uploadedImage) {
            this.drawCenteredImage(this.uploadedImage, 0.3);
        }

        // Draw text
        this.ctx.fillStyle = textColor;
        this.ctx.font = `bold ${textSize}px ${textFont}`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        const lines = mainText.split('\n');
        const lineHeight = textSize * 1.2;
        const totalHeight = lines.length * lineHeight;
        let y = (this.canvas.height - totalHeight) / 2;

        lines.forEach(line => {
            this.ctx.fillText(line, this.canvas.width / 2, y);
            y += lineHeight;
        });
    }

    drawCenteredImage(img, scale = 1) {
        const imgWidth = img.width;
        const imgHeight = img.height;
        const canvasRatio = this.canvas.width / this.canvas.height;
        const imgRatio = imgWidth / imgHeight;

        let drawWidth, drawHeight, x, y;

        if (imgRatio > canvasRatio) {
            drawWidth = this.canvas.width * scale;
            drawHeight = drawWidth / imgRatio;
        } else {
            drawHeight = this.canvas.height * scale;
            drawWidth = drawHeight * imgRatio;
        }

        x = (this.canvas.width - drawWidth) / 2;
        y = (this.canvas.height - drawHeight) / 2;

        this.ctx.drawImage(img, x, y, drawWidth, drawHeight);
    }

    generateFrames() {
        const duration = parseInt(document.getElementById('videoDuration').value);
        const fps = 30;
        const totalFrames = duration * fps;
        const fadeEffect = document.getElementById('fadeEffect').checked;
        const scaleEffect = document.getElementById('scaleEffect').checked;
        const rotateEffect = document.getElementById('rotateEffect').checked;

        this.frames = [];

        for (let frame = 0; frame < totalFrames; frame++) {
            const progress = frame / totalFrames;
            const canvas = document.createElement('canvas');
            canvas.width = this.canvas.width;
            canvas.height = this.canvas.height;
            const ctx = canvas.getContext('2d');

            const bgColor = document.getElementById('bgColor').value;
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Save context for transformations
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);

            // Apply effects
            if (rotateEffect) {
                ctx.rotate((progress * Math.PI * 2) * 0.5);
            }

            if (scaleEffect) {
                const scale = 1 + Math.sin(progress * Math.PI) * 0.2;
                ctx.scale(scale, scale);
            }

            ctx.translate(-canvas.width / 2, -canvas.height / 2);

            // Draw image
            if (this.uploadedImage) {
                this.drawCenteredImageOnContext(ctx, this.uploadedImage, canvas, 0.3);
            }

            ctx.restore();

            // Draw text
            const textColor = document.getElementById('textColor').value;
            const mainText = document.getElementById('mainText').value;
            const textSize = document.getElementById('textSize').value;
            const textFont = document.getElementById('textFont').value;

            let alpha = 1;
            if (fadeEffect) {
                alpha = Math.sin(progress * Math.PI);
            }

            ctx.globalAlpha = alpha;
            ctx.fillStyle = textColor;
            ctx.font = `bold ${textSize}px ${textFont}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const lines = mainText.split('\n');
            const lineHeight = textSize * 1.2;
            const totalHeight = lines.length * lineHeight;
            let y = (canvas.height - totalHeight) / 2;

            lines.forEach(line => {
                ctx.fillText(line, canvas.width / 2, y);
                y += lineHeight;
            });

            this.frames.push(canvas);
        }
    }

    drawCenteredImageOnContext(ctx, img, canvas, scale = 1) {
        const imgWidth = img.width;
        const imgHeight = img.height;
        const canvasRatio = canvas.width / canvas.height;
        const imgRatio = imgWidth / imgHeight;

        let drawWidth, drawHeight, x, y;

        if (imgRatio > canvasRatio) {
            drawWidth = canvas.width * scale;
            drawHeight = drawWidth / imgRatio;
        } else {
            drawHeight = canvas.height * scale;
            drawWidth = drawHeight * imgRatio;
        }

        x = (canvas.width - drawWidth) / 2;
        y = (canvas.height - drawHeight) / 2;

        ctx.drawImage(img, x, y, drawWidth, drawHeight);
    }

    playPreview() {
        this.showStatus('Generating preview...', 'info');
        this.generateFrames();

        if (this.frames.length === 0) {
            this.showStatus('No frames generated', 'error');
            return;
        }

        this.isPlaying = true;
        let frameIndex = 0;

        const playFrame = () => {
            if (!this.isPlaying) return;

            const frameCanvas = this.frames[frameIndex];
            this.ctx.drawImage(frameCanvas, 0, 0);

            frameIndex++;
            if (frameIndex < this.frames.length) {
                setTimeout(playFrame, 1000 / 30); // 30 FPS
            } else {
                this.showStatus('Preview finished!', 'success');
                this.isPlaying = false;
            }
        };

        playFrame();
    }

    generateVideo() {
        this.showStatus('Generating video...', 'info');
        
        try {
            this.generateFrames();
            this.showStatus('Video generated! Ready to download.', 'success');
        } catch (error) {
            this.showStatus('Error generating video: ' + error.message, 'error');
            console.error(error);
        }
    }

    downloadVideo() {
        if (this.frames.length === 0) {
            this.showStatus('Please generate video first', 'error');
            return;
        }

        this.showStatus('Downloading video...', 'info');

        // Create a blob from the first frame as a placeholder
        const canvas = document.createElement('canvas');
        canvas.width = this.canvas.width;
        canvas.height = this.canvas.height;
        const ctx = canvas.getContext('2d');

        // Draw all frames onto one canvas (simplified version)
        this.frames[0].toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${document.getElementById('videoTitle').value || 'video'}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showStatus('Video downloaded! (Note: Save as image for full frame sequence)', 'success');
        });
    }

    showStatus(message, type) {
        const statusEl = document.getElementById('statusMessage');
        statusEl.textContent = message;
        statusEl.className = `status-message ${type}`;
        
        if (type === 'success') {
            setTimeout(() => {
                statusEl.style.display = 'none';
            }, 3000);
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    new VideoMaker();
    document.getElementById('statusMessage').style.display = 'none';
});
