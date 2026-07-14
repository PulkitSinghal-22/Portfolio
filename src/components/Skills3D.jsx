import React, { useEffect, useRef, useState } from 'react';

const SKILLS_LIST = [
  "React.js", "JavaScript", "HTML5", "CSS3", "Tailwind CSS",
  "C++", "MongoDB", "Git", "GitHub", "VS Code",
  "OS", "Networks", "UI/UX", "MERN Stack", "Express.js",
  "Node.js", "Antigravity"
];

export default function Skills3D() {
  const containerRef = useRef(null);
  const [hoveredTag, setHoveredTag] = useState(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || 480;
    let height = container.clientHeight || 480;
    const radius = 175; // Sphere radius

    // Create 3D points for tags distributed evenly using Fibonacci spiral
    const N = SKILLS_LIST.length;
    let tags = SKILLS_LIST.map((name, i) => {
      const phi = Math.acos(-1 + (2 * i + 1) / N);
      const theta = Math.sqrt(N * Math.PI) * phi;
      return {
        name,
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.sin(phi) * Math.sin(theta),
        z: radius * Math.cos(phi),
        el: null // will bind to DOM element ref
      };
    });

    // Create DOM elements dynamically
    const elements = tags.map((tag, idx) => {
      const el = document.createElement('span');
      el.className = 'skill-tag-3d';
      el.textContent = tag.name;
      
      // Bind hover state
      el.addEventListener('mouseenter', () => {
        el.classList.add('highlighted');
        setHoveredTag(idx);
      });
      el.addEventListener('mouseleave', () => {
        el.classList.remove('highlighted');
        setHoveredTag(null);
      });
      
      container.appendChild(el);
      tag.el = el;
      return el;
    });

    // Interaction states
    let rotateXVelocity = 0.003;
    let rotateYVelocity = 0.003;
    let targetXVelocity = 0.003;
    let targetYVelocity = 0.003;
    let isDragging = false;
    let startMouseX = 0;
    let startMouseY = 0;

    const handleMouseDown = (e) => {
      isDragging = true;
      startMouseX = e.clientX;
      startMouseY = e.clientY;
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - startMouseX;
      const deltaY = e.clientY - startMouseY;
      
      // Update target velocities based on drag distances
      targetYVelocity = deltaX * 0.00015;
      targetXVelocity = -deltaY * 0.00015;

      startMouseX = e.clientX;
      startMouseY = e.clientY;
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Performance Visibility Observer
    let isVisible = true;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
      });
    }, { threshold: 0.05 });
    observer.observe(container);

    let animationFrameId;

    // Projection calculation & rendering loop
    const render = () => {
      animationFrameId = requestAnimationFrame(render);

      if (!isVisible || document.visibilityState === 'hidden') return;

      // Friction / deceleration easing when not dragging
      if (!isDragging) {
        targetXVelocity += (0.002 - targetXVelocity) * 0.05;
        targetYVelocity += (0.002 - targetYVelocity) * 0.05;
      }

      rotateXVelocity += (targetXVelocity - rotateXVelocity) * 0.1;
      rotateYVelocity += (targetYVelocity - rotateYVelocity) * 0.1;

      // Rotate coords
      tags.forEach(tag => {
        // Rotate around X-axis
        const cosX = Math.cos(rotateXVelocity);
        const sinX = Math.sin(rotateXVelocity);
        const y1 = tag.y * cosX - tag.z * sinX;
        const z1 = tag.y * sinX + tag.z * cosX;

        // Rotate around Y-axis
        const cosY = Math.cos(rotateYVelocity);
        const sinY = Math.sin(rotateYVelocity);
        const x2 = tag.x * cosY - z1 * sinY;
        const z2 = tag.x * sinY + z1 * cosY;

        tag.x = x2;
        tag.y = y1;
        tag.z = z2;

        // Perspective Projection
        const focalLength = 320;
        const scale = focalLength / (focalLength + tag.z); // scale factor based on depth
        const screenX = tag.x * scale + width / 2;
        const screenY = tag.y * scale + height / 2;

        // Opacity scaling based on depth
        const opacity = (tag.z + radius) / (2 * radius) * 0.65 + 0.35;
        const size = scale * 1.1; // size amplification

        if (tag.el) {
          tag.el.style.transform = `translate3d(${screenX}px, ${screenY}px, 0px) scale(${size})`;
          // Lower opacity on tags moving away
          tag.el.style.opacity = opacity;
          // Set z-index to avoid overlap order bugs
          tag.el.style.zIndex = Math.round(scale * 100);
        }
      });
    };

    render();

    // Resize Handler
    const handleResize = () => {
      width = container.clientWidth || 480;
      height = container.clientHeight || 480;
    };
    window.addEventListener('resize', handleResize);

    // Cleanup memory
    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('resize', handleResize);
      observer.unobserve(container);
      
      // Remove span elements
      elements.forEach(el => {
        if (container.contains(el)) {
          container.removeChild(el);
        }
      });
    };
  }, []);

  return (
    <div className="skills-3d-sphere-container">
      <div 
        ref={containerRef} 
        className="skills-3d-canvas-wrapper" 
        style={{ position: 'relative', width: '100%', height: '100%' }}
      />
    </div>
  );
}
