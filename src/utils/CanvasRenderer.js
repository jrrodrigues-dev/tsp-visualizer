/**
 * ENTERPRISE CANVAS RENDERER - WORLD CLASS VISUALIZATION
 * Ultra-premium visual rendering for TSP optimization
 */
class CanvasRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.animationFrame = null;
        this.setupCanvas();
        this.initializeTheme();
    }

    setupCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);

        this.width = rect.width;
        this.height = rect.height;

        // Enable smooth rendering
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
    }

    initializeTheme() {
        this.theme = {
            background: {
                primary: '#0B1426',
                secondary: '#1A2332',
                gradient: 'linear-gradient(135deg, #0B1426 0%, #1A2332 50%, #0B1426 100%)'
            },
            grid: {
                color: 'rgba(255, 255, 255, 0.08)',
                width: 1,
                spacing: 40
            },
            route: {
                color: '#10B981',
                width: 4,
                shadow: '#10B981',
                shadowBlur: 12,
                glowIntensity: 0.3
            },
            city: {
                startColor: '#EF4444',
                normalColor: '#FFFFFF',
                shadowColor: 'rgba(0, 0, 0, 0.4)',
                borderColor: '#1F2937',
                radius: 14,
                borderWidth: 3
            },
            arrow: {
                color: '#10B981',
                size: 14,
                spacing: 0.7
            }
        };
    }

    /**
     * MAIN RENDERING METHOD - ENTERPRISE GRADE
     */
    draw(cities, route, options = {}) {
        this.clear();
        this.drawEnterpriseBackground();
        this.drawGrid();

        if (route.length > 1) {
            this.drawRouteWithAnimation(cities, route, options);
        }

        this.drawCities(cities);

        if (options.showProgress) {
            this.drawOptimizationProgress(options.progress || 0);
        }

        this.drawPerformanceOverlay();
    }

    /**
     * DRAW EXAMPLE FOR EMPTY STATE
     */
    drawExample(exampleCities, exampleRoute) {
        this.clear();
        this.drawEnterpriseBackground();
        this.drawGrid();

        // Draw semi-transparent example
        this.ctx.globalAlpha = 0.6;
        this.drawRouteWithAnimation(exampleCities, exampleRoute);
        this.drawCities(exampleCities);
        this.ctx.globalAlpha = 1;

        // Draw "EXAMPLE" watermark
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.font = 'bold 48px Inter, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('CLICK TO ADD CITIES', this.width / 2, this.height / 2 + 100);
    }

    /**
     * ENTERPRISE BACKGROUND WITH GRADIENT
     */
    drawEnterpriseBackground() {
        // Create radial gradient for depth
        const gradient = this.ctx.createRadialGradient(
            this.width / 2, this.height / 2, 0,
            this.width / 2, this.height / 2, Math.max(this.width, this.height) / 2
        );

        gradient.addColorStop(0, '#1A2332');
        gradient.addColorStop(0.5, '#0B1426');
        gradient.addColorStop(1, '#000000');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Add subtle noise texture
        this.addNoiseTexture();
    }

    /**
     * ADD PREMIUM NOISE TEXTURE
     */
    addNoiseTexture() {
        const imageData = this.ctx.createImageData(this.width, this.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const noise = Math.random() * 10;
            data[i] = noise;     // Red
            data[i + 1] = noise; // Green
            data[i + 2] = noise; // Blue
            data[i + 3] = 3;     // Alpha (very subtle)
        }

        this.ctx.putImageData(imageData, 0, 0);
    }

    /**
     * ENTERPRISE GRID SYSTEM
     */
    drawGrid() {
        const { color, width, spacing } = this.theme.grid;

        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = width;
        this.ctx.lineCap = 'round';

        // Major grid lines
        this.ctx.globalAlpha = 0.3;
        for (let x = 0; x <= this.width; x += spacing * 2) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }

        for (let y = 0; y <= this.height; y += spacing * 2) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }

        // Minor grid lines
        this.ctx.globalAlpha = 0.1;
        for (let x = spacing; x <= this.width; x += spacing * 2) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }

        for (let y = spacing; y <= this.height; y += spacing * 2) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }

        this.ctx.globalAlpha = 1;
    }

    /**
     * PREMIUM ROUTE VISUALIZATION WITH GLOW EFFECTS
     */
    drawRouteWithAnimation(cities, route, options = {}) {
        if (route.length < 2) return;

        const { color, width, shadow, shadowBlur, glowIntensity } = this.theme.route;

        // Show optimization progress with different colors
        const progressColor = options.showProgress ?
            `hsl(${120 + (options.progress || 0) * 1.2}, 70%, 50%)` : color;

        // Outer glow
        this.ctx.strokeStyle = progressColor;
        this.ctx.lineWidth = width + 8;
        this.ctx.globalAlpha = glowIntensity;
        this.ctx.shadowColor = progressColor;
        this.ctx.shadowBlur = shadowBlur * 2;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        this.drawRoutePath(cities, route);

        // Main route line
        this.ctx.globalAlpha = 1;
        this.ctx.shadowBlur = shadowBlur;
        this.ctx.strokeStyle = progressColor;
        this.ctx.lineWidth = width;

        this.drawRoutePath(cities, route);

        // Reset shadow
        this.ctx.shadowBlur = 0;
        this.ctx.globalAlpha = 1;

        // Draw premium direction arrows
        this.drawPremiumArrows(cities, route, progressColor);
    }

    /**
     * DRAW ROUTE PATH
     */
    drawRoutePath(cities, route) {
        this.ctx.beginPath();

        for (let i = 0; i < route.length; i++) {
            const currentCity = cities[route[i]];
            const nextCity = cities[route[(i + 1) % route.length]];

            if (i === 0) {
                this.ctx.moveTo(currentCity.x, currentCity.y);
            }

            // Use bezier curves for smoother lines
            const cp1x = currentCity.x + (nextCity.x - currentCity.x) * 0.1;
            const cp1y = currentCity.y + (nextCity.y - currentCity.y) * 0.1;
            const cp2x = currentCity.x + (nextCity.x - currentCity.x) * 0.9;
            const cp2y = currentCity.y + (nextCity.y - currentCity.y) * 0.9;

            this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, nextCity.x, nextCity.y);
        }

        this.ctx.stroke();
    }

    /**
     * PREMIUM DIRECTION ARROWS
     */
    drawPremiumArrows(cities, route, color = this.theme.arrow.color) {
        const { size, spacing } = this.theme.arrow;

        this.ctx.fillStyle = color;
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = 8;

        for (let i = 0; i < route.length; i++) {
            const currentCity = cities[route[i]];
            const nextCity = cities[route[(i + 1) % route.length]];

            const dx = nextCity.x - currentCity.x;
            const dy = nextCity.y - currentCity.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Only draw arrow if distance is sufficient
            if (distance < 40) continue;

            const angle = Math.atan2(dy, dx);
            const arrowX = currentCity.x + dx * spacing;
            const arrowY = currentCity.y + dy * spacing;

            this.ctx.save();
            this.ctx.translate(arrowX, arrowY);
            this.ctx.rotate(angle);

            // Premium arrow shape
            this.ctx.beginPath();
            this.ctx.moveTo(-size, -size / 2);
            this.ctx.lineTo(0, 0);
            this.ctx.lineTo(-size, size / 2);
            this.ctx.lineTo(-size * 0.7, 0);
            this.ctx.closePath();
            this.ctx.fill();

            this.ctx.restore();
        }

        this.ctx.shadowBlur = 0;
    }

    /**
     * DRAW OPTIMIZATION PROGRESS INDICATOR
     */
    drawOptimizationProgress(progress) {
        const barHeight = 6;
        const barWidth = this.width * 0.8;
        const barX = (this.width - barWidth) / 2;
        const barY = this.height - 40;

        // Background bar
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);

        // Progress bar
        const progressWidth = (barWidth * progress) / 100;
        const gradient = this.ctx.createLinearGradient(barX, 0, barX + barWidth, 0);
        gradient.addColorStop(0, '#10B981');
        gradient.addColorStop(1, '#06B6D4');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(barX, barY, progressWidth, barHeight);

        // Progress text
        this.ctx.fillStyle = 'white';
        this.ctx.font = '14px Inter, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`Optimizing: ${progress.toFixed(0)}%`, this.width / 2, barY - 10);
    }

    /**
     * ENTERPRISE CITY VISUALIZATION
     */
    drawCities(cities) {
        const { startColor, normalColor, shadowColor, borderColor, radius, borderWidth } = this.theme.city;

        cities.forEach((city, index) => {
            const isStartCity = index === 0;

            // Premium shadow with blur
            this.ctx.fillStyle = shadowColor;
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
            this.ctx.shadowBlur = 12;
            this.ctx.shadowOffsetX = 4;
            this.ctx.shadowOffsetY = 4;
            this.ctx.beginPath();
            this.ctx.arc(city.x, city.y, radius + 2, 0, Math.PI * 2);
            this.ctx.fill();

            // Reset shadow for main city
            this.ctx.shadowBlur = 0;
            this.ctx.shadowOffsetX = 0;
            this.ctx.shadowOffsetY = 0;

            // Main city with gradient
            const gradient = this.ctx.createRadialGradient(
                city.x - radius / 3, city.y - radius / 3, 0,
                city.x, city.y, radius
            );

            if (isStartCity) {
                gradient.addColorStop(0, '#FCA5A5');
                gradient.addColorStop(1, startColor);
            } else {
                gradient.addColorStop(0, '#FFFFFF');
                gradient.addColorStop(1, '#E5E7EB');
            }

            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(city.x, city.y, radius, 0, Math.PI * 2);
            this.ctx.fill();

            // Premium border
            this.ctx.strokeStyle = borderColor;
            this.ctx.lineWidth = borderWidth;
            this.ctx.stroke();

            // Glow effect for start city
            if (isStartCity) {
                this.ctx.shadowColor = startColor;
                this.ctx.shadowBlur = 15;
                this.ctx.stroke();
                this.ctx.shadowBlur = 0;
            }

            // City number with premium typography
            this.ctx.fillStyle = isStartCity ? '#FFFFFF' : '#1F2937';
            this.ctx.font = 'bold 16px Inter, sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';

            // Text shadow for better readability
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            this.ctx.shadowBlur = 2;
            this.ctx.fillText(index.toString(), city.x, city.y);
            this.ctx.shadowBlur = 0;
        });
    }

    /**
     * PERFORMANCE OVERLAY (Optional)
     */
    drawPerformanceOverlay() {
        // Add subtle performance indicators if needed
        // This could show FPS, render time, etc.
    }

    /**
     * CLEAR WITH PREMIUM EFFECTS
     */
    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    /**
     * RESIZE HANDLER
     */
    resize() {
        this.setupCanvas();
    }

    /**
     * EXPORT CANVAS AS SVG
     */
    exportAsSVG(filename = 'tsp-solution.svg') {
        // Create SVG content
        let svgContent = `<svg width="${this.width}" height="${this.height}" xmlns="http://www.w3.org/2000/svg">`;

        // Add styles
        svgContent += `<defs>
        <style>
          .route { stroke: #10B981; stroke-width: 4; fill: none; }
          .city { fill: white; stroke: #1F2937; stroke-width: 3; }
          .start-city { fill: #EF4444; }
          .city-text { font-family: Inter, sans-serif; font-size: 16px; font-weight: bold; text-anchor: middle; dominant-baseline: middle; }
        </style>
      </defs>`;

        // Add background
        svgContent += `<rect width="100%" height="100%" fill="#0B1426"/>`;

        // This is a simplified SVG export - in a full implementation,
        // you'd recreate all the visual elements in SVG format

        svgContent += '</svg>';

        // Download SVG
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    }

    /**
     * CLEANUP
     */
    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
}

export default CanvasRenderer;