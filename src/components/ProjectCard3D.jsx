import React, { useEffect, useRef } from 'react';

export default function ProjectCard3D({ type, isHovered }) {
  const canvasRef = useRef(null);
  const isHoveredRef = useRef(isHovered);

  // Sync hover state ref for access within the requestAnimationFrame loop
  useEffect(() => {
    isHoveredRef.current = isHovered;
  }, [isHovered]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.clientWidth || 400;
    let height = canvas.clientHeight || 160;
    canvas.width = width;
    canvas.height = height;

    // Retrieve theme colors
    const style = getComputedStyle(document.documentElement);
    const primaryColor = style.getPropertyValue('--primary').trim() || '#7c4dff';
    const secondaryColor = style.getPropertyValue('--secondary').trim() || '#00e5ff';
    const accentColor = style.getPropertyValue('--accent').trim() || '#ff007f';

    const hexToRgb = (hex) => {
      const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      const parsedHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(parsedHex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 124, g: 77, b: 255 };
    };

    const primaryRGB = hexToRgb(primaryColor);
    const secondaryRGB = hexToRgb(secondaryColor);

    let animationFrameId;
    let timer = 0;

    // ==========================================
    // 1. SMART SERVE: Logistics Node Network setup
    // ==========================================
    const nodeCount = 7;
    const nodes = [];
    if (type === 'smartserve') {
      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          x: Math.random() * (width - 40) + 20,
          y: Math.random() * (height - 40) + 20,
          vx: (Math.random() - 0.5) * 0.45,
          vy: (Math.random() - 0.5) * 0.45,
          radius: Math.random() * 2.5 + 3,
          speedOffset: Math.random() * 8
        });
      }
    }

    // ==========================================
    // 2. SPOTIFY CLONE: Equalizer bars setup
    // ==========================================
    const barCount = 18;
    const barWidth = 4.5;
    const barSpacing = 7;
    const totalBarWidth = (barCount * barWidth) + ((barCount - 1) * (barSpacing - barWidth));
    const startX = (width - totalBarWidth) / 2;

    // ==========================================
    // 3. TRADING APP: Candlestick chart setup
    // ==========================================
    const candleCount = 8;
    const candleSpacing = 28;
    const totalCandleWidth = candleCount * candleSpacing;
    const tradingStartX = (width - totalCandleWidth) / 2 + 10;
    let sweepPos = 0;

    const candleHeights = [22, 14, 32, 12, 26, 38, 20, 28];
    const candleOffsets = [15, -8, 20, 8, -5, 12, -18, 4];
    const candleDirections = [true, false, true, true, false, true, false, true]; // true: green, false: red

    // ==========================================
    // Animation Render Loop
    // ==========================================
    const draw = () => {
      animationFrameId = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, width, height);
      timer += isHoveredRef.current ? 0.05 : 0.015;

      if (type === 'smartserve') {
        // Draw Logistics lines
        for (let i = 0; i < nodeCount; i++) {
          const p1 = nodes[i];
          for (let j = i + 1; j < nodeCount; j++) {
            const p2 = nodes[j];
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 100) {
              const baseOpacity = isHoveredRef.current ? 0.35 : 0.15;
              const opacity = baseOpacity * (1 - dist / 100);
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `rgba(${primaryRGB.r}, ${primaryRGB.g}, ${primaryRGB.b}, ${opacity})`;
              ctx.lineWidth = isHoveredRef.current ? 1.25 : 0.85;
              ctx.stroke();
            }
          }
        }

        // Draw Logistics nodes
        for (let i = 0; i < nodeCount; i++) {
          const p = nodes[i];
          
          // Organic drift
          p.x += p.vx * (isHoveredRef.current ? 2.5 : 1.0);
          p.y += p.vy * (isHoveredRef.current ? 2.5 : 1.0);

          // Boundaries wrap
          if (p.x < 10 || p.x > width - 10) p.vx *= -1;
          if (p.y < 10 || p.y > height - 10) p.vy *= -1;

          // Glowing radial gradient
          const glowRad = isHoveredRef.current ? p.radius * 2.5 : p.radius * 1.5;
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRad);
          gradient.addColorStop(0, `rgba(${secondaryRGB.r}, ${secondaryRGB.g}, ${secondaryRGB.b}, 1)`);
          gradient.addColorStop(0.3, `rgba(${secondaryRGB.r}, ${secondaryRGB.g}, ${secondaryRGB.b}, 0.35)`);
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

          ctx.beginPath();
          ctx.arc(p.x, p.y, glowRad, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        }

      } else if (type === 'spotify') {
        // Draw Audio Equalizer Bars
        const gradient = ctx.createLinearGradient(0, height, 0, 20);
        gradient.addColorStop(0, primaryColor);
        gradient.addColorStop(1, secondaryColor);

        for (let i = 0; i < barCount; i++) {
          const barX = startX + i * barSpacing;
          const offset = i * 0.45;
          
          // Dynamic wave equations
          let heightVal = Math.sin(timer + offset) * 32 + 45;
          if (isHoveredRef.current) {
            heightVal += Math.cos(timer * 2 + offset) * 20; // more aggressive wave motion
          }
          const finalHeight = Math.max(8, heightVal);

          // Rounded bars layout
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(barX, height - finalHeight - 15, barWidth, finalHeight, 3);
          ctx.fill();
        }

      } else if (type === 'trading') {
        // Draw Gridlines in background
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 0.5;
        for (let l = 20; l < height; l += 25) {
          ctx.beginPath();
          ctx.moveTo(10, l);
          ctx.lineTo(width - 10, l);
          ctx.stroke();
        }

        // Draw Candlesticks
        for (let i = 0; i < candleCount; i++) {
          const x = tradingStartX + i * candleSpacing;
          const h = candleHeights[i];
          const offset = candleOffsets[i];
          const isUp = candleDirections[i];
          const y = height / 2 - h / 2 + offset;

          const color = isUp ? '#10b981' : accentColor;

          // Wick lines
          ctx.strokeStyle = color;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x + 2, y - 8);
          ctx.lineTo(x + 2, y + h + 8);
          ctx.stroke();

          // Body rectangles
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.roundRect(x - 2, y, 8, h, 1.5);
          ctx.fill();
        }

        // Sweeping scanner line on hover
        if (isHoveredRef.current) {
          sweepPos += 2.2;
          if (sweepPos > width) sweepPos = 0;

          // Scanning sweep gradient glow
          const sweepGlow = ctx.createLinearGradient(sweepPos - 12, 0, sweepPos + 2, 0);
          sweepGlow.addColorStop(0, 'rgba(0, 229, 255, 0)');
          sweepGlow.addColorStop(0.8, 'rgba(0, 229, 255, 0.25)');
          sweepGlow.addColorStop(1, 'rgba(0, 229, 255, 0.7)');

          ctx.fillStyle = sweepGlow;
          ctx.fillRect(sweepPos - 12, 10, 14, height - 20);

          ctx.beginPath();
          ctx.moveTo(sweepPos, 10);
          ctx.lineTo(sweepPos, height - 10);
          ctx.strokeStyle = secondaryColor;
          ctx.lineWidth = 1.25;
          ctx.stroke();
        }
      }
    };

    draw();

    // Resize Handler
    const handleResize = () => {
      width = canvas.clientWidth || 400;
      height = canvas.clientHeight || 160;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', handleResize);

    // Cleanup memory
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [type]);

  return (
    <canvas 
      ref={canvasRef} 
      style={{
        width: '100%',
        height: '100%',
        display: 'block'
      }}
    />
  );
}
