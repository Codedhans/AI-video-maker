// AI Text-to-Video Maker Class
class AIVideoMaker {
    constructor() {
        this.canvas = document.getElementById('videoPreview');
        this.ctx = this.canvas.getContext('2d');
        this.frames = [];
        this.isGenerating = false;
        this.isPlaying = false;
        this.videoData = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.drawDefaultPreview();
    }

    setupEventListeners() {
        // Main action buttons
        document.getElementById('generateBtn').addEventListener('click', () => this.generateVideo());
        document.getElementById('previewBtn').addEventListener('click', () => this.playPreview());
        document.getElementById('downloadBtn').addEventListener('click', () => this.downloadVideo());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetAll());

        // Input listeners for real-time updates
        document.getElementById('videoPrompt').addEventListener('input', () => this.drawDefaultPreview());
        document.getElementById('aspectRatio').addEventListener('change', () => this.updateCanvasDimensions());
    }

    drawDefaultPreview() {
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw placeholder text
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 32px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        const prompt = document.getElementById('videoPrompt').value;
        this.ctx.fillText('🎬 Ready to Generate', this.canvas.width / 2, this.canvas.height / 2 - 40);
        
        this.ctx.font = '16px Arial';
        this.ctx.fillStyle = '#aaa';
        const displayPrompt = prompt.substring(0, 50) + (prompt.length > 50 ? '...' : '');
        this.ctx.fillText(displayPrompt, this.canvas.width / 2, this.canvas.height / 2 + 20);
    }

    updateCanvasDimensions() {
        const aspectRatio = document.getElementById('aspectRatio').value;
        const baseHeight = 480;
        let width = 720;

        if (aspectRatio === '9:16') {
            width = 405;
        } else if (aspectRatio === '1:1') {
            width = baseHeight;
        }

        this.canvas.width = width;
        this.canvas.height = baseHeight;
        this.drawDefaultPreview();
    }

    async generateVideo() {
        const prompt = document.getElementById('videoPrompt').value.trim();
        
        if (!prompt) {
            this.showStatus('Please enter a video description', 'error');
            return;
        }

        if (this.isGenerating) {
            this.showStatus('Video generation already in progress', 'warning');
            return;
        }

        this.isGenerating = true;
        document.getElementById('generateBtn').disabled = true;
        document.getElementById('generateBtn').classList.add('loading');
        
        const generationInfo = document.getElementById('generationInfo');
        generationInfo.style.display = 'block';
        
        this.showStatus('Starting video generation from your prompt...', 'info');
        this.updateGenerationInfo('Initializing', 0, 0);

        try {
            const duration = parseInt(document.getElementById('videoDuration').value);
            const numFrames = parseInt(document.getElementById('numFrames').value);
            const apiKey = document.getElementById('apiKey').value;

            // Check if using real API or demo
            if (apiKey) {
                await this.generateWithAPI(prompt, numFrames, duration, apiKey);
            } else {
                await this.generateDemo(prompt, numFrames, duration);
            }

            this.showStatus('✅ Video generated successfully!', 'success');
            this.updateGenerationInfo('Complete', 100, numFrames);
            
            // Enable preview and download buttons
            document.getElementById('previewBtn').disabled = false;
            document.getElementById('downloadBtn').disabled = false;

        } catch (error) {
            console.error('Error:', error);
            this.showStatus(`Error generating video: ${error.message}`, 'error');
        } finally {
            this.isGenerating = false;
            document.getElementById('generateBtn').disabled = false;
            document.getElementById('generateBtn').classList.remove('loading');
        }
    }

    async generateDemo(prompt, numFrames, duration) {
        // Demo generation without real AI API
        // Generates colorful animated frames based on keywords in the prompt
        
        this.frames = [];
        const transitionEffect = document.getElementById('transitionEffect').value;
        
        // Extract keywords to influence colors
        const keywords = prompt.toLowerCase();
        const colors = this.extractColorsFromPrompt(keywords);
        
        for (let frame = 0; frame < numFrames; frame++) {
            const progress = frame / numFrames;
            const canvas = document.createElement('canvas');
            canvas.width = this.canvas.width;
            canvas.height = this.canvas.height;
            const ctx = canvas.getContext('2d');

            // Create background
            const bgColor = this.interpolateColor(colors[0], colors[1], progress);
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw animated shapes based on transition effect
            this.drawAnimatedContent(ctx, canvas, progress, transitionEffect, keywords);

            // Add text overlay
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.font = 'bold 28px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Frame ' + (frame + 1) + ' / ' + numFrames, canvas.width / 2, 40);

            this.frames.push(canvas);
            
            // Update progress
            const percentage = Math.round((frame / numFrames) * 100);
            this.updateGenerationInfo('Generating frames', percentage, frame + 1);
        }

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    async generateWithAPI(prompt, numFrames, duration, apiKey) {
        // This would connect to real AI video generation APIs
        // Placeholder for integration with:
        // - Replicate API (for Stable Diffusion)
        // - Hugging Face (for various models)
        // - Custom backend

        // For now, show warning and fall back to demo
        this.showStatus('⚠️ API integration in progress. Using demo generation.', 'warning');
        await this.generateDemo(prompt, numFrames, duration);
    }

    drawAnimatedContent(ctx, canvas, progress, effect, keywords) {
        ctx.save();

        // Translate to center for transformations
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        ctx.translate(centerX, centerY);

        // Apply transition effect
        switch (effect) {
            case 'fade':
                ctx.globalAlpha = Math.abs(Math.sin(progress * Math.PI));
                break;
            case 'slide':
                ctx.translate((progress - 0.5) * canvas.width, 0);
                break;
            case 'zoom':
                const scale = 0.8 + Math.sin(progress * Math.PI) * 0.4;
                ctx.scale(scale, scale);
                break;
            case 'morph':
                ctx.globalAlpha = Math.sin(progress * Math.PI);
                const morphScale = 0.5 + progress * 0.5;
                ctx.scale(morphScale, morphScale);
                break;
        }

        // Draw based on keywords
        this.drawContentShapes(ctx, canvas, keywords, progress);

        ctx.restore();
    }

    drawContentShapes(ctx, canvas, keywords, progress) {
        // Draw different shapes based on detected keywords
        if (keywords.includes('cat') || keywords.includes('animal')) {
            this.drawCat(ctx, progress);
        } else if (keywords.includes('circle') || keywords.includes('ball')) {
            this.drawBall(ctx, progress);
        } else if (keywords.includes('wave') || keywords.includes('water')) {
            this.drawWaves(ctx, canvas, progress);
        } else if (keywords.includes('star') || keywords.includes('night')) {
            this.drawStars(ctx, canvas, progress);
        } else {
            this.drawGenericShapes(ctx, canvas, progress);
        }
    }

    drawCat(ctx, progress) {
        const size = 80;
        // Head
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();

        // Ears
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.arc(-size * 0.4, -size * 0.6, size * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(size * 0.4, -size * 0.6, size * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-size * 0.25, -size * 0.15, size * 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(size * 0.25, -size * 0.15, size * 0.15, 0, Math.PI * 2);
        ctx.fill();

        // Pupils
        ctx.fillStyle = '#000';
        const pupilX = Math.cos(progress * Math.PI * 2) * size * 0.1;
        ctx.beginPath();
        ctx.arc(-size * 0.25 + pupilX, -size * 0.15, size * 0.08, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(size * 0.25 + pupilX, -size * 0.15, size * 0.08, 0, Math.PI * 2);
        ctx.fill();

        // Nose
        ctx.fillStyle = '#FF69B4';
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.08, 0, Math.PI * 2);
        ctx.fill();
    }

    drawBall(ctx, progress) {
        const radius = 50;
        const x = Math.cos(progress * Math.PI * 2) * 100;
        const y = Math.sin(progress * Math.PI * 2) * 100;

        const gradient = ctx.createRadialGradient(x - 15, y - 15, 5, x, y, radius);
        gradient.addColorStop(0, '#FFD700');
        gradient.addColorStop(1, '#FF8C00');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(x - 15, y - 15, 15, 0, Math.PI * 2);
        ctx.fill();
    }

    drawWaves(ctx, canvas, progress) {
        const waveAmplitude = 30;
        const frequency = 0.05;
        
        ctx.strokeStyle = '#4A90E2';
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.7;

        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            const yOffset = i * 50 - 75 + Math.sin(progress * Math.PI * 2) * 20;
            
            for (let x = -canvas.width / 2; x < canvas.width / 2; x += 10) {
                const y = Math.sin((x + progress * 200) * frequency) * waveAmplitude + yOffset;
                if (x === -canvas.width / 2) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();
        }
    }

    drawStars(ctx, canvas, progress) {
        const starCount = 20;
        for (let i = 0; i < starCount; i++) {
            const angle = (i / starCount) * Math.PI * 2;
            const distance = 150;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            
            const opacity = 0.3 + Math.sin(progress * Math.PI * 2 + i) * 0.7;
            ctx.fillStyle = `rgba(255, 255, 100, ${opacity})`;
            
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawGenericShapes(ctx, canvas, progress) {
        // Draw rotating rectangles and circles
        ctx.fillStyle = '#48bb78';
        ctx.save();
        ctx.rotate(progress * Math.PI * 2);
        ctx.fillRect(-40, -60, 80, 120);
        ctx.restore();

        ctx.fillStyle = '#ed8936';
        ctx.beginPath();
        ctx.arc(0, 0, 40, 0, Math.PI * 2);
        ctx.fill();
    }

    extractColorsFromPrompt(prompt) {
        // Map keywords to color pairs
        const colorMap = {
            'sunset': ['#FF6B6B', '#FFE66D'],
            'ocean': ['#1E3A8A', '#0EA5E9'],
            'forest': ['#15803D', '#84CC16'],
            'night': ['#1F2937', '#7C3AED'],
            'fire': ['#EF4444', '#FCD34D'],
            'sky': ['#87CEEB', '#E0F2FE'],
            'beach': ['#F97316', '#FEF08A'],
            'purple': ['#7C3AED', '#E9D5FF'],
            'pink': ['#EC4899', '#FCE7F3'],
            'cyan': ['#06B6D4', '#CFFAFE'],
        };

        for (const [keyword, colors] of Object.entries(colorMap)) {
            if (prompt.includes(keyword)) {
                return colors;
            }
        }

        // Default colors
        return ['#1a1a2e', '#16213e'];
    }

    interpolateColor(color1, color2, t) {
        const c1 = this.hexToRgb(color1);
        const c2 = this.hexToRgb(color2);

        const r = Math.round(c1.r + (c2.r - c1.r) * t);
        const g = Math.round(c1.g + (c2.g - c1.g) * t);
        const b = Math.round(c1.b + (c2.b - c1.b) * t);

        return `rgb(${r}, ${g}, ${b})`;
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    playPreview() {
        if (this.frames.length === 0) {
            this.showStatus('Please generate a video first', 'error');
            return;
        }

        this.isPlaying = true;
        document.getElementById('generateBtn').disabled = true;
        document.getElementById('previewBtn').disabled = true;
        
        let frameIndex = 0;
        const fps = 30;

        const playFrame = () => {
            if (!this.isPlaying || frameIndex >= this.frames.length) {
                this.isPlaying = false;
                document.getElementById('generateBtn').disabled = false;
                document.getElementById('previewBtn').disabled = false;
                if (frameIndex >= this.frames.length) {
                    this.showStatus('✅ Preview finished!', 'success');
                }
                return;
            }

            const frameCanvas = this.frames[frameIndex];
            this.ctx.drawImage(frameCanvas, 0, 0, this.canvas.width, this.canvas.height);
            
            frameIndex++;
            setTimeout(playFrame, 1000 / fps);
        };

        this.showStatus('▶️ Playing preview...', 'info');
        playFrame();
    }

    async downloadVideo() {
        if (this.frames.length === 0) {
            this.showStatus('Please generate a video first', 'error');
            return;
        }

        this.showStatus('⬇️ Preparing video download...', 'info');

        try {
            // Convert frames to a video format (WebM)
            const videoBlob = await this.createVideoFromFrames(this.frames);
            
            const url = URL.createObjectURL(videoBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ai-video-${Date.now()}.webm`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showStatus('✅ Video downloaded successfully!', 'success');
        } catch (error) {
            console.error('Download error:', error);
            this.showStatus(`Download error: ${error.message}`, 'error');
        }
    }

    async createVideoFromFrames(frames) {
        // Create a simple video file (for production, use FFmpeg.js)
        // For now, we'll create a WebM blob by combining frames
        
        return new Promise((resolve) => {
            // Simple fallback: convert to GIF-like format
            const canvas = document.createElement('canvas');
            canvas.width = frames[0].width;
            canvas.height = frames[0].height;
            const ctx = canvas.getContext('2d');

            let frameIndex = 0;
            const frames_data = [];

            const captureFrame = () => {
                if (frameIndex < frames.length) {
                    ctx.drawImage(frames[frameIndex], 0, 0);
                    canvas.toBlob(blob => {
                        frames_data.push(blob);
                        frameIndex++;
                        captureFrame();
                    });
                } else {
                    // For now, return the combined blob (in production, use proper video codec)
                    const blob = new Blob(frames_data, { type: 'video/webm' });
                    resolve(blob);
                }
            };

            captureFrame();
        });
    }

    resetAll() {
        this.frames = [];
        this.isPlaying = false;
        this.videoData = null;
        
        document.getElementById('videoPrompt').value = 'A cat playing with a ball in the living room';
        document.getElementById('videoDuration').value = 10;
        document.getElementById('numFrames').value = 10;
        document.getElementById('previewBtn').disabled = true;
        document.getElementById('downloadBtn').disabled = true;
        document.getElementById('generateBtn').disabled = false;
        
        const generationInfo = document.getElementById('generationInfo');
        generationInfo.style.display = 'none';
        
        this.drawDefaultPreview();
        this.showStatus('Reset complete', 'info');
    }

    updateGenerationInfo(status, progress, framesCount) {
        document.getElementById('statusValue').textContent = status;
        document.getElementById('progressFill').style.width = progress + '%';
        document.getElementById('framesCount').textContent = framesCount;
        
        // Calculate estimated time
        const totalFrames = parseInt(document.getElementById('numFrames').value);
        const timePerFrame = 1; // seconds
        const estimatedTotal = totalFrames * timePerFrame;
        const remaining = estimatedTotal - (progress / 100 * estimatedTotal);
        
        const minutes = Math.floor(remaining / 60);
        const seconds = Math.floor(remaining % 60);
        document.getElementById('estimatedTime').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    showStatus(message, type = 'info') {
        const statusEl = document.getElementById('statusMessage');
        statusEl.textContent = message;
        statusEl.className = `status-message ${type}`;
        
        if (type === 'success') {
            setTimeout(() => {
                statusEl.style.display = 'none';
            }, 5000);
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    new AIVideoMaker();
});
