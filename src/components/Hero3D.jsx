import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Hero3D() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || 550;
    let height = container.clientHeight || 550;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    camera.position.z = 450;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Retrieve theme colors
    const style = getComputedStyle(document.documentElement);
    const primaryColorStr = style.getPropertyValue('--primary').trim() || '#7c4dff';
    const secondaryColorStr = style.getPropertyValue('--secondary').trim() || '#00e5ff';
    const accentColorStr = style.getPropertyValue('--accent').trim() || '#ff007f';

    const primaryColor = new THREE.Color(primaryColorStr);
    const secondaryColor = new THREE.Color(secondaryColorStr);
    const accentColor = new THREE.Color(accentColorStr);

    const pointLight1 = new THREE.PointLight(secondaryColor, 2, 300);
    pointLight1.position.set(100, 100, 150);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(primaryColor, 1.8, 300);
    pointLight2.position.set(-100, -100, 150);
    scene.add(pointLight2);

    // Parent group for tilt
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // Core Particle Sphere
    const coreParticlesCount = 350;
    const coreGeometry = new THREE.BufferGeometry();
    const corePositions = new Float32Array(coreParticlesCount * 3);
    const origRadius = 100; // surrounds avatar nicely
    const sphericalDirs = [];

    for (let i = 0; i < coreParticlesCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      
      const x = Math.sin(phi) * Math.cos(theta);
      const y = Math.sin(phi) * Math.sin(theta);
      const z = Math.cos(phi);

      sphericalDirs.push({ x, y, z });

      corePositions[i * 3] = x * origRadius;
      corePositions[i * 3 + 1] = y * origRadius;
      corePositions[i * 3 + 2] = z * origRadius;
    }

    coreGeometry.setAttribute('position', new THREE.BufferAttribute(corePositions, 3));

    const coreMaterial = new THREE.PointsMaterial({
      color: secondaryColor,
      size: 3.5,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });

    const coreParticles = new THREE.Points(coreGeometry, coreMaterial);
    mainGroup.add(coreParticles);

    // Orbital Rings Setup
    const rings = [];

    // Ring 1 (Torus) - Inner
    const ring1Geom = new THREE.TorusGeometry(125, 1.4, 8, 80);
    const ring1Mat = new THREE.MeshPhysicalMaterial({
      color: primaryColor,
      emissive: primaryColor,
      emissiveIntensity: 0.6,
      metalness: 0.9,
      roughness: 0.1,
      transparent: true,
      opacity: 0.65
    });
    const ring1 = new THREE.Mesh(ring1Geom, ring1Mat);
    ring1.rotation.x = Math.PI / 3.5;
    ring1.rotation.y = Math.PI / 6;
    mainGroup.add(ring1);
    rings.push({ mesh: ring1, rotX: 0.004, rotY: 0.008, rotZ: 0 });

    // Ring 2 (Torus) - Middle
    const ring2Geom = new THREE.TorusGeometry(145, 1.0, 8, 80);
    const ring2Mat = new THREE.MeshPhysicalMaterial({
      color: secondaryColor,
      emissive: secondaryColor,
      emissiveIntensity: 0.5,
      metalness: 0.9,
      roughness: 0.1,
      transparent: true,
      opacity: 0.55
    });
    const ring2 = new THREE.Mesh(ring2Geom, ring2Mat);
    ring2.rotation.x = -Math.PI / 3;
    ring2.rotation.y = -Math.PI / 5;
    mainGroup.add(ring2);
    rings.push({ mesh: ring2, rotX: -0.006, rotY: 0.004, rotZ: 0 });

    // Ring 3 (Torus) - Outer
    const ring3Geom = new THREE.TorusGeometry(165, 0.8, 8, 80);
    const ring3Mat = new THREE.MeshPhysicalMaterial({
      color: accentColor,
      emissive: accentColor,
      emissiveIntensity: 0.4,
      metalness: 0.9,
      roughness: 0.1,
      transparent: true,
      opacity: 0.45
    });
    const ring3 = new THREE.Mesh(ring3Geom, ring3Mat);
    ring3.rotation.x = Math.PI / 2.2;
    ring3.rotation.z = Math.PI / 4;
    mainGroup.add(ring3);
    rings.push({ mesh: ring3, rotX: 0.002, rotY: 0, rotZ: -0.01 });

    // Mouse Interactions Setup
    let mouseTilt = { x: 0, y: 0, targetX: 0, targetY: 0 };
    let rotationMultiplier = 1;

    // We locate the closest .hero-visual container in the page
    const heroVisual = container.closest('.hero-visual');

    const handleMouseMove = (e) => {
      if (!heroVisual) return;
      const rect = heroVisual.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      mouseTilt.targetX = (y / (rect.height / 2)) * 0.35;
      mouseTilt.targetY = (x / (rect.width / 2)) * 0.35;
      rotationMultiplier = 2.8; // speed up rotations on hover
    };

    const handleMouseLeave = () => {
      mouseTilt.targetX = 0;
      mouseTilt.targetY = 0;
      rotationMultiplier = 1;
    };

    // Pulse shockwave variables
    let isPulsing = false;
    let pulseTime = 0;

    const handleMouseDown = () => {
      if (!isPulsing) {
        isPulsing = true;
        pulseTime = 0;
        
        pointLight1.intensity = 5.0;
        pointLight2.intensity = 5.0;
        coreMaterial.size = 6.0;
      }
    };

    if (heroVisual) {
      heroVisual.addEventListener('mousemove', handleMouseMove);
      heroVisual.addEventListener('mouseleave', handleMouseLeave);
      heroVisual.addEventListener('mousedown', handleMouseDown);
    }

    // Resize Handler
    const handleResize = () => {
      width = container.clientWidth || 550;
      height = container.clientHeight || 550;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Performance Optimization: visibility observer
    let isHeroOnScreen = true;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isHeroOnScreen = entry.isIntersecting;
      });
    }, { threshold: 0.05 });

    if (heroVisual) {
      observer.observe(heroVisual);
    }

    // Tab visible check
    let isTabActive = true;
    const handleVisibility = () => {
      isTabActive = document.visibilityState === 'visible';
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Animation Loop
    let timer = 0;
    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isHeroOnScreen || !isTabActive) return;

      timer += 0.015;

      // Parallax Tilt Easing
      mouseTilt.x += (mouseTilt.targetX - mouseTilt.x) * 0.08;
      mouseTilt.y += (mouseTilt.targetY - mouseTilt.y) * 0.08;

      mainGroup.rotation.x = mouseTilt.x;
      mainGroup.rotation.y = mouseTilt.y;

      // Spin core points
      coreParticles.rotation.y += 0.002 * rotationMultiplier;
      coreParticles.rotation.x += 0.001 * rotationMultiplier;

      // Animate core points
      const corePosArr = coreGeometry.attributes.position.array;
      for (let i = 0; i < coreParticlesCount; i++) {
        const idx = i * 3;
        const dir = sphericalDirs[i];

        let radius = origRadius;

        // Wave breathing oscillations
        const waveOffset = Math.sin(timer * 2.5 + dir.x * 4 + dir.y * 4) * 5;
        radius += waveOffset;

        // Radial Shockwave calculation
        if (isPulsing) {
          pulseTime += 0.0012;
          const progress = pulseTime * 12;
          
          if (progress < 1) {
            const pulseDisplacement = Math.sin(progress * Math.PI) * 110;
            radius += pulseDisplacement;
          } else {
            isPulsing = false;
            pulseTime = 0;
            
            pointLight1.intensity = 2;
            pointLight2.intensity = 1.8;
            coreMaterial.size = 3.5;
          }
        }

        corePosArr[idx] = dir.x * radius;
        corePosArr[idx + 1] = dir.y * radius;
        corePosArr[idx + 2] = dir.z * radius;
      }
      coreGeometry.attributes.position.needsUpdate = true;

      // Orbit rings spin
      rings.forEach(ring => {
        if (ring.rotX) ring.mesh.rotation.x += ring.rotX * rotationMultiplier;
        if (ring.rotY) ring.mesh.rotation.y += ring.rotY * rotationMultiplier;
        if (ring.rotZ) ring.mesh.rotation.z += ring.rotZ * rotationMultiplier;
      });

      renderer.render(scene, camera);
    };

    animate();

    // Memory Disposal & Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
      
      if (heroVisual) {
        heroVisual.removeEventListener('mousemove', handleMouseMove);
        heroVisual.removeEventListener('mouseleave', handleMouseLeave);
        heroVisual.removeEventListener('mousedown', handleMouseDown);
        observer.unobserve(heroVisual);
      }

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      // Dispose Geometries and Materials
      coreGeometry.dispose();
      coreMaterial.dispose();
      ring1Geom.dispose();
      ring1Mat.dispose();
      ring2Geom.dispose();
      ring2Mat.dispose();
      ring3Geom.dispose();
      ring3Mat.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} id="hero-3d-canvas-container" />;
}
