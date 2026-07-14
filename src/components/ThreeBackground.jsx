import React, { useEffect, useRef } from 'react';

export default function ThreeBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Retrieve colors dynamically
    const style = getComputedStyle(document.documentElement);
    const primaryColor = style.getPropertyValue('--primary').trim() || '#7c4dff';
    const secondaryColor = style.getPropertyValue('--secondary').trim() || '#00e5ff';

    // Helper to convert hex colors to rgb for opacity drawing
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

    // Node count (scaled dynamically for performance/screen size)
    const particleCount = Math.min(85, Math.floor((width * height) / 16000));
    const particles = [];
    const maxDistance = 120; // maximum link connection distance

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: Math.random() * 1.5 + 1.2
      });
    }

    // Mouse coordinates tracking
    let mouse = { x: 0, y: 0, targetX: 0, targetY: 0, active: false };

    const handleMouseMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Resize handler
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);

    // Visibility tab focus checking
    let isTabActive = true;
    const handleVisibility = () => {
      isTabActive = document.visibilityState === 'visible';
    };
    document.addEventListener('visibilitychange', handleVisibility);

    let animationFrameId;

    // Animation Loop
    const draw = () => {
      animationFrameId = requestAnimationFrame(draw);

      if (!isTabActive) return;

      // Clear Canvas
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse follow easing (lerp)
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      // 1. Physics update & calculate actual parallax-rendered coordinates
      const renderedCoords = [];
      const dx = mouse.x - width / 2;
      const dy = mouse.y - height / 2;

      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];

        // Update positions (base drift velocity)
        p.x += p.vx;
        p.y += p.vy;

        // Bounce checks
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Clamp inside bounds in case window gets resized smaller
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        // Parallax offset
        const parallaxX = (dx * 0.018) * (p.radius - 0.8);
        const parallaxY = (dy * 0.018) * (p.radius - 0.8);

        let rX = p.x + parallaxX;
        let rY = p.y + parallaxY;

        // Repel force field (gently push particles away from cursor)
        if (mouse.active) {
          const dxMouse = rX - mouse.x;
          const dyMouse = rY - mouse.y;
          const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

          if (distMouse < 130) {
            const force = (130 - distMouse) / 130;
            // Shift base coordinates organically
            p.x += (dxMouse / distMouse) * force * 1.8;
            p.y += (dyMouse / distMouse) * force * 1.8;
            
            // Re-calculate rendered coordinate after force push
            rX = p.x + parallaxX;
            rY = p.y + parallaxY;
          }
        }

        renderedCoords.push({
          rX,
          rY,
          radius: p.radius
        });
      }

      // 2. Greedy Nearest-Neighbor search to construct a continuous Snake path
      const unvisited = new Set(Array.from({ length: particleCount }, (_, idx) => idx));
      const snakePath = [];

      // Start the snake from the particle closest to the cursor if mouse is active
      let currentIdx = -1;
      if (mouse.active) {
        let minDist = Infinity;
        for (let i = 0; i < particleCount; i++) {
          const pt = renderedCoords[i];
          const dxMouse = pt.rX - mouse.x;
          const dyMouse = pt.rY - mouse.y;
          const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
          if (distMouse < minDist) {
            minDist = distMouse;
            currentIdx = i;
          }
        }
      }

      // Default start if mouse is not in view
      if (currentIdx === -1) {
        currentIdx = 0;
      }

      snakePath.push(currentIdx);
      unvisited.delete(currentIdx);

      // Traversal loop
      while (unvisited.size > 0) {
        const currentPt = renderedCoords[currentIdx];
        let nearestIdx = -1;
        let nearestDist = Infinity;

        // Find nearest unvisited node
        for (const idx of unvisited) {
          const pt = renderedCoords[idx];
          const dxPair = currentPt.rX - pt.rX;
          const dyPair = currentPt.rY - pt.rY;
          const distPair = Math.sqrt(dxPair * dxPair + dyPair * dyPair);

          if (distPair < nearestDist) {
            nearestDist = distPair;
            nearestIdx = idx;
          }
        }

        if (nearestIdx !== -1) {
          snakePath.push(nearestIdx);
          unvisited.delete(nearestIdx);
          currentIdx = nearestIdx;
        } else {
          break;
        }
      }

      // 3. Draw the wending Snake path
      if (snakePath.length > 0) {
        ctx.beginPath();
        
        // Remove glow shadow to make it extremely subtle and faint (very less visible)
        ctx.shadowBlur = 0;

        if (mouse.active) {
          // Snake head links to cursor
          const firstPt = renderedCoords[snakePath[0]];
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(firstPt.rX, firstPt.rY);
        } else {
          const firstPt = renderedCoords[snakePath[0]];
          ctx.moveTo(firstPt.rX, firstPt.rY);
        }

        for (let i = 1; i < snakePath.length; i++) {
          const pt = renderedCoords[snakePath[i]];
          ctx.lineTo(pt.rX, pt.rY);
        }

        ctx.strokeStyle = `rgba(${primaryRGB.r}, ${primaryRGB.g}, ${primaryRGB.b}, 0.06)`; // extremely subtle opacity
        ctx.lineWidth = 0.8; // thin lines
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.stroke();

        // Draw secondary connector highlights from cursor to nearby nodes
        if (mouse.active) {
          ctx.shadowBlur = 0;
          for (let i = 0; i < Math.min(4, snakePath.length); i++) {
            const pt = renderedCoords[snakePath[i]];
            const dxCursor = pt.rX - mouse.x;
            const dyCursor = pt.rY - mouse.y;
            const distCursor = Math.sqrt(dxCursor * dxCursor + dyCursor * dyCursor);

            if (distCursor < 150) {
              const opacity = 0.08 * (1 - distCursor / 150); // very faint
              ctx.beginPath();
              ctx.moveTo(mouse.x, mouse.y);
              ctx.lineTo(pt.rX, pt.rY);
              ctx.strokeStyle = `rgba(${secondaryRGB.r}, ${secondaryRGB.g}, ${secondaryRGB.b}, ${opacity})`;
              ctx.lineWidth = 0.6;
              ctx.stroke();
            }
          }
        }

        // Reset shadow properties for subsequent node drawings
        ctx.shadowBlur = 0;
      }

      // 4. Draw particle circles
      for (let i = 0; i < particleCount; i++) {
        const p = renderedCoords[i];
        ctx.beginPath();
        ctx.arc(p.rX, p.rY, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${secondaryRGB.r}, ${secondaryRGB.g}, ${secondaryRGB.b}, 0.55)`;
        ctx.fill();
      }
    };

    draw();

    // Clean up memory
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -2,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}
    />
  );
}
