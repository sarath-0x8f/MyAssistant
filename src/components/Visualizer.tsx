import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface VisualizerProps {
  isListening: boolean;
  isSpeaking: boolean;
}

export default function Visualizer({ isListening, isSpeaking }: VisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const stateRef = useRef({ isListening, isSpeaking });

  useEffect(() => {
    stateRef.current = { isListening, isSpeaking };
  }, [isListening, isSpeaking]);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Create multiple waveform lines
    const segments = 256;
    const lines: THREE.Line[] = [];
    const lineCount = 5;

    for (let l = 0; l < lineCount; l++) {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(segments * 3);
      const colors = new Float32Array(segments * 3);

      for (let i = 0; i < segments; i++) {
        const x = (i / segments) * 12 - 6;
        positions[i * 3] = x;
        positions[i * 3 + 1] = 0;
        positions[i * 3 + 2] = l * -0.3;

        const brightness = 1 - l * 0.18;
        colors[i * 3] = brightness;
        colors[i * 3 + 1] = brightness;
        colors[i * 3 + 2] = brightness;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const material = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.9 - l * 0.15,
        linewidth: 1,
      });

      const line = new THREE.Line(geometry, material);
      scene.add(line);
      lines.push(line);
    }

    // Create particle field
    const particleCount = 100;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 12;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 3;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 2;
      particleSizes[i] = Math.random() * 2 + 0.5;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));

    const particleMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.02,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Animation
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      timeRef.current += 0.016;

      const time = timeRef.current;
      const { isListening: listening, isSpeaking: speaking } = stateRef.current;
      const intensity = speaking ? 1.8 : listening ? 1.2 : 0.3;
      const speed = speaking ? 2.5 : listening ? 1.8 : 0.6;

      // Update each waveform line
      lines.forEach((line, lineIndex) => {
        const posAttr = line.geometry.getAttribute('position') as THREE.BufferAttribute;
        const colAttr = line.geometry.getAttribute('color') as THREE.BufferAttribute;

        const lineOffset = lineIndex * 0.5;
        const lineIntensity = intensity * (1 - lineIndex * 0.12);

        for (let i = 0; i < segments; i++) {
          const normalizedX = i / segments;
          const x = normalizedX * 12 - 6;

          // Complex wave composition
          const wave1 = Math.sin(x * 1.5 + time * speed + lineOffset) * 0.35;
          const wave2 = Math.sin(x * 3 + time * speed * 1.4 + lineOffset * 2) * 0.18;
          const wave3 = Math.sin(x * 6 + time * speed * 0.8 + lineOffset * 3) * 0.09;
          const wave4 = Math.sin(x * 12 + time * speed * 2.2 + lineOffset) * 0.04;
          
          // Noise-like variation
          const noise = Math.sin(x * 20 + time * 5) * Math.sin(time * 3 + x) * 0.03;
          
          // Envelope - stronger in center, fades at edges
          const envelope = Math.pow(Math.sin(normalizedX * Math.PI), 0.8) * lineIntensity;
          
          // Random spikes for speaking effect
          const spike = speaking ? 
            Math.sin(normalizedX * 30 + time * 8) * Math.sin(time * 4) * 0.15 : 0;
          
          const y = (wave1 + wave2 + wave3 + wave4 + noise + spike) * envelope;
          
          posAttr.setY(i, y);

          // Dynamic color based on amplitude
          const amplitude = Math.abs(y);
          const brightness = 0.4 + amplitude * 3;
          const b = Math.min(brightness, 1) * (1 - lineIndex * 0.15);
          colAttr.setXYZ(i, b, b, b);
        }

        posAttr.needsUpdate = true;
        colAttr.needsUpdate = true;
      });

      // Animate particles
      const particlePos = particles.geometry.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < particleCount; i++) {
        const x = particlePos.getX(i);
        const baseY = particlePos.getY(i);
        
        // Particles move with the wave
        const waveY = Math.sin(x * 2 + time * speed) * intensity * 0.3;
        particlePos.setY(i, baseY + (waveY - baseY) * 0.01);
        
        // Slow drift
        let newX = x + 0.005;
        if (newX > 6) newX = -6;
        particlePos.setX(i, newX);
      }
      particlePos.needsUpdate = true;

      // Particle opacity based on state
      particleMaterial.opacity = speaking ? 0.5 : listening ? 0.35 : 0.15;

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameRef.current);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="visualizer-canvas"
    />
  );
}
