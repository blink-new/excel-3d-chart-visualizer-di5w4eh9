import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { ChartData, ChartConfig } from '../App';
import { Button } from './ui/button';
import { Download, RotateCcw } from 'lucide-react';

interface Chart3DProps {
  data: ChartData;
  config: ChartConfig;
}

const colorSchemes = {
  blue: ['#3B82F6', '#1D4ED8', '#1E40AF', '#1E3A8A'],
  green: ['#10B981', '#059669', '#047857', '#065F46'],
  purple: ['#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6'],
  orange: ['#F59E0B', '#D97706', '#B45309', '#92400E'],
  red: ['#EF4444', '#DC2626', '#B91C1C', '#991B1B']
};

export function Chart3D({ data, config }: Chart3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const barsRef = useRef<THREE.Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const mountElement = mountRef.current;
    if (!mountElement) return;

    setIsLoading(true);

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfafafa);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountElement.clientWidth / mountElement.clientHeight,
      0.1,
      1000
    );
    camera.position.set(15, 15, 15);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(mountElement.clientWidth, mountElement.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    mountElement.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Create bars
    const barsGroup = new THREE.Group();
    barsRef.current = barsGroup;
    scene.add(barsGroup);

    const maxValue = Math.max(...data.values);
    const colors = colorSchemes[config.colorScheme as keyof typeof colorSchemes] || colorSchemes.blue;

    data.values.forEach((value, index) => {
      const barHeight = (value / maxValue) * config.chartHeight;
      const geometry = new THREE.BoxGeometry(0.8, barHeight, 0.8);
      
      const colorIndex = index % colors.length;
      const material = new THREE.MeshLambertMaterial({ 
        color: colors[colorIndex],
        transparent: true,
        opacity: 0.9
      });
      
      const bar = new THREE.Mesh(geometry, material);
      bar.position.set(
        (index - data.values.length / 2) * 1.2,
        barHeight / 2,
        0
      );
      bar.castShadow = true;
      bar.receiveShadow = true;
      
      // Add value label
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.width = 256;
      canvas.height = 128;
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, 256, 128);
      context.fillStyle = '#000000';
      context.font = 'bold 24px Inter';
      context.textAlign = 'center';
      context.fillText(value.toString(), 128, 45);
      context.fillText(data.labels[index], 128, 85);
      
      const texture = new THREE.CanvasTexture(canvas);
      const labelMaterial = new THREE.MeshBasicMaterial({ 
        map: texture,
        transparent: true,
        opacity: 0.9
      });
      const labelGeometry = new THREE.PlaneGeometry(2, 1);
      const label = new THREE.Mesh(labelGeometry, labelMaterial);
      label.position.set(
        (index - data.values.length / 2) * 1.2,
        barHeight + 1,
        0
      );
      label.lookAt(camera.position);
      
      barsGroup.add(bar);
      barsGroup.add(label);
    });

    // Grid
    if (config.showGrid) {
      const gridHelper = new THREE.GridHelper(20, 20, 0xcccccc, 0xeeeeee);
      scene.add(gridHelper);
    }

    // Mouse controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (event: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: event.clientX, y: event.clientY };
    };

    const onMouseMove = (event: MouseEvent) => {
      if (!isDragging) return;

      const deltaMove = {
        x: event.clientX - previousMousePosition.x,
        y: event.clientY - previousMousePosition.y
      };

      const spherical = new THREE.Spherical();
      spherical.setFromVector3(camera.position);
      
      spherical.theta -= deltaMove.x * 0.01;
      spherical.phi += deltaMove.y * 0.01;
      spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));

      camera.position.setFromSpherical(spherical);
      camera.lookAt(0, 0, 0);

      previousMousePosition = { x: event.clientX, y: event.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (event: WheelEvent) => {
      const scale = event.deltaY > 0 ? 1.1 : 0.9;
      camera.position.multiplyScalar(scale);
      camera.position.clampLength(5, 50);
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('wheel', onWheel);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    setIsLoading(false);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('wheel', onWheel);
      
      if (mountElement && renderer.domElement) {
        mountElement.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [data, config]);

  const resetCamera = () => {
    if (cameraRef.current) {
      cameraRef.current.position.set(15, 15, 15);
      cameraRef.current.lookAt(0, 0, 0);
    }
  };

  const exportChart = () => {
    if (rendererRef.current) {
      const link = document.createElement('a');
      link.download = 'chart-3d.png';
      link.href = rendererRef.current.domElement.toDataURL();
      link.click();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Interactive 3D Chart</h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={resetCamera}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset View
          </Button>
          <Button variant="outline" size="sm" onClick={exportChart}>
            <Download className="h-4 w-4 mr-2" />
            Export PNG
          </Button>
        </div>
      </div>
      
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
            <div className="text-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground">Generating 3D chart...</p>
            </div>
          </div>
        )}
        
        <div 
          ref={mountRef} 
          className="chart-canvas w-full h-[500px] bg-card rounded-lg border"
          style={{ cursor: 'grab' }}
        />
        
        <div className="mt-2 text-xs text-muted-foreground text-center">
          Drag to rotate • Scroll to zoom • Click Reset View to return to default position
        </div>
      </div>
    </div>
  );
}