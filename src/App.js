import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, RotateCcw, Plus, Download, Target, Zap, GitBranch, Clock, ChevronDown, FileText, Image, ArrowLeft, Github } from 'lucide-react';

// ===== TSP ALGORITHMS CLASS =====
class TSPAlgorithms {
  constructor(cities) {
    this.cities = cities;
  }

  calculateDistance(city1, city2) {
    const dx = city1.x - city2.x;
    const dy = city1.y - city2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  calculateTotalDistance(route) {
    if (route.length < 2) return 0;
    let total = 0;
    for (let i = 0; i < route.length; i++) {
      const current = this.cities[route[i]];
      const next = this.cities[route[(i + 1) % route.length]];
      if (current && next) {
        total += this.calculateDistance(current, next);
      }
    }
    return total;
  }

  nearestNeighbor() {
    if (this.cities.length < 2) return { route: [], distance: 0 };

    const unvisited = new Set([...Array(this.cities.length).keys()]);
    const route = [0];
    unvisited.delete(0);

    while (unvisited.size > 0) {
      const current = route[route.length - 1];
      let nearest = null;
      let minDistance = Infinity;

      for (const cityIndex of unvisited) {
        const distance = this.calculateDistance(
          this.cities[current],
          this.cities[cityIndex]
        );
        if (distance < minDistance) {
          minDistance = distance;
          nearest = cityIndex;
        }
      }

      if (nearest !== null) {
        route.push(nearest);
        unvisited.delete(nearest);
      }
    }

    return {
      route,
      distance: this.calculateTotalDistance(route)
    };
  }

  twoOpt(initialRoute) {
    let improved = true;
    let bestRoute = [...initialRoute];
    let bestDistance = this.calculateTotalDistance(bestRoute);
    let iterations = 0;
    const maxIterations = Math.min(1000, this.cities.length * 10);

    while (improved && iterations < maxIterations) {
      improved = false;
      iterations++;

      for (let i = 1; i < bestRoute.length - 2; i++) {
        for (let j = i + 1; j < bestRoute.length; j++) {
          if (j - i === 1) continue;

          const newRoute = [...bestRoute];
          const segment = newRoute.slice(i, j + 1).reverse();
          newRoute.splice(i, j - i + 1, ...segment);

          const newDistance = this.calculateTotalDistance(newRoute);

          if (newDistance < bestDistance) {
            bestRoute = newRoute;
            bestDistance = newDistance;
            improved = true;
            break;
          }
        }
        if (improved) break;
      }
    }

    return { route: bestRoute, distance: bestDistance };
  }

  geneticAlgorithm() {
    const populationSize = Math.min(50, Math.max(20, this.cities.length * 2));
    const generations = Math.min(100, this.cities.length * 5);
    const mutationRate = 0.02;
    const eliteSize = Math.floor(populationSize * 0.2);

    let population = this.initializePopulation(populationSize);

    for (let gen = 0; gen < generations; gen++) {
      const fitness = population.map(route => ({
        route: [...route],
        distance: this.calculateTotalDistance(route)
      }));

      fitness.sort((a, b) => a.distance - b.distance);
      const newPopulation = fitness.slice(0, eliteSize).map(f => [...f.route]);

      while (newPopulation.length < populationSize) {
        const parent1 = this.tournamentSelection(fitness, 5);
        const parent2 = this.tournamentSelection(fitness, 5);
        const child = this.orderCrossover(parent1.route, parent2.route);

        if (Math.random() < mutationRate) {
          this.mutate(child);
        }

        newPopulation.push(child);
      }

      population = newPopulation;
    }

    const finalFitness = population.map(route => ({
      route,
      distance: this.calculateTotalDistance(route)
    }));

    finalFitness.sort((a, b) => a.distance - b.distance);
    return {
      route: finalFitness[0].route,
      distance: finalFitness[0].distance
    };
  }

  hybrid() {
    const nnResult = this.nearestNeighbor();
    const optimizedResult = this.twoOpt(nnResult.route);
    return optimizedResult;
  }

  initializePopulation(size) {
    const population = [];
    for (let i = 0; i < size; i++) {
      const route = [...Array(this.cities.length).keys()];
      for (let j = route.length - 1; j > 0; j--) {
        const k = Math.floor(Math.random() * (j + 1));
        [route[j], route[k]] = [route[k], route[j]];
      }
      population.push(route);
    }
    return population;
  }

  tournamentSelection(fitness, tournamentSize) {
    let best = fitness[Math.floor(Math.random() * fitness.length)];
    for (let i = 1; i < tournamentSize; i++) {
      const competitor = fitness[Math.floor(Math.random() * fitness.length)];
      if (competitor.distance < best.distance) {
        best = competitor;
      }
    }
    return best;
  }

  orderCrossover(parent1, parent2) {
    const length = parent1.length;
    const start = Math.floor(Math.random() * length);
    const end = Math.floor(Math.random() * (length - start)) + start;

    const child = new Array(length).fill(-1);

    for (let i = start; i <= end; i++) {
      child[i] = parent1[i];
    }

    let parentIndex = 0;
    for (let i = 0; i < length; i++) {
      if (child[i] === -1) {
        while (child.includes(parent2[parentIndex])) {
          parentIndex++;
        }
        child[i] = parent2[parentIndex];
        parentIndex++;
      }
    }

    return child;
  }

  mutate(route) {
    const i = Math.floor(Math.random() * route.length);
    const j = Math.floor(Math.random() * route.length);
    [route[i], route[j]] = [route[j], route[i]];
  }
}

// ===== CANVAS RENDERER CLASS =====
class CanvasRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
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

    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
  }

  initializeTheme() {
    this.theme = {
      background: {
        primary: '#0B1426',
        secondary: '#1A2332'
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
  }

  drawExample(exampleCities, exampleRoute) {
    this.clear();
    this.drawEnterpriseBackground();
    this.drawGrid();

    this.ctx.globalAlpha = 0.6;
    this.drawRouteWithAnimation(exampleCities, exampleRoute);
    this.drawCities(exampleCities);
    this.ctx.globalAlpha = 1;

    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.font = 'bold 48px Inter, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('CLICK TO ADD CITIES', this.width / 2, this.height / 2 + 100);
  }

  drawEnterpriseBackground() {
    const gradient = this.ctx.createRadialGradient(
      this.width / 2, this.height / 2, 0,
      this.width / 2, this.height / 2, Math.max(this.width, this.height) / 2
    );

    gradient.addColorStop(0, '#1A2332');
    gradient.addColorStop(0.5, '#0B1426');
    gradient.addColorStop(1, '#000000');

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawGrid() {
    const { color, width, spacing } = this.theme.grid;

    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;
    this.ctx.lineCap = 'round';

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

  drawRouteWithAnimation(cities, route, options = {}) {
    if (route.length < 2) return;

    const { color, width, shadow, shadowBlur, glowIntensity } = this.theme.route;
    const progressColor = options.showProgress ?
      `hsl(${120 + (options.progress || 0) * 1.2}, 70%, 50%)` : color;

    this.ctx.strokeStyle = progressColor;
    this.ctx.lineWidth = width + 8;
    this.ctx.globalAlpha = glowIntensity;
    this.ctx.shadowColor = progressColor;
    this.ctx.shadowBlur = shadowBlur * 2;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    this.drawRoutePath(cities, route);

    this.ctx.globalAlpha = 1;
    this.ctx.shadowBlur = shadowBlur;
    this.ctx.strokeStyle = progressColor;
    this.ctx.lineWidth = width;

    this.drawRoutePath(cities, route);

    this.ctx.shadowBlur = 0;
    this.ctx.globalAlpha = 1;

    this.drawPremiumArrows(cities, route, progressColor);
  }

  drawRoutePath(cities, route) {
    this.ctx.beginPath();

    for (let i = 0; i < route.length; i++) {
      const currentCity = cities[route[i]];
      const nextCity = cities[route[(i + 1) % route.length]];

      if (i === 0) {
        this.ctx.moveTo(currentCity.x, currentCity.y);
      }

      const cp1x = currentCity.x + (nextCity.x - currentCity.x) * 0.1;
      const cp1y = currentCity.y + (nextCity.y - currentCity.y) * 0.1;
      const cp2x = currentCity.x + (nextCity.x - currentCity.x) * 0.9;
      const cp2y = currentCity.y + (nextCity.y - currentCity.y) * 0.9;

      this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, nextCity.x, nextCity.y);
    }

    this.ctx.stroke();
  }

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

      if (distance < 40) continue;

      const angle = Math.atan2(dy, dx);
      const arrowX = currentCity.x + dx * spacing;
      const arrowY = currentCity.y + dy * spacing;

      this.ctx.save();
      this.ctx.translate(arrowX, arrowY);
      this.ctx.rotate(angle);

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

  drawOptimizationProgress(progress) {
    const barHeight = 6;
    const barWidth = this.width * 0.8;
    const barX = (this.width - barWidth) / 2;
    const barY = this.height - 40;

    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    this.ctx.fillRect(barX, barY, barWidth, barHeight);

    const progressWidth = (barWidth * progress) / 100;
    const gradient = this.ctx.createLinearGradient(barX, 0, barX + barWidth, 0);
    gradient.addColorStop(0, '#10B981');
    gradient.addColorStop(1, '#06B6D4');

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(barX, barY, progressWidth, barHeight);

    this.ctx.fillStyle = 'white';
    this.ctx.font = '14px Inter, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`Optimizing: ${progress.toFixed(0)}%`, this.width / 2, barY - 10);
  }

  drawCities(cities) {
    const { startColor, normalColor, shadowColor, borderColor, radius, borderWidth } = this.theme.city;

    cities.forEach((city, index) => {
      const isStartCity = index === 0;

      this.ctx.fillStyle = shadowColor;
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      this.ctx.shadowBlur = 12;
      this.ctx.shadowOffsetX = 4;
      this.ctx.shadowOffsetY = 4;
      this.ctx.beginPath();
      this.ctx.arc(city.x, city.y, radius + 2, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.shadowBlur = 0;
      this.ctx.shadowOffsetX = 0;
      this.ctx.shadowOffsetY = 0;

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

      this.ctx.strokeStyle = borderColor;
      this.ctx.lineWidth = borderWidth;
      this.ctx.stroke();

      if (isStartCity) {
        this.ctx.shadowColor = startColor;
        this.ctx.shadowBlur = 15;
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
      }

      this.ctx.fillStyle = isStartCity ? '#FFFFFF' : '#1F2937';
      this.ctx.font = 'bold 16px Inter, sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';

      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      this.ctx.shadowBlur = 2;
      this.ctx.fillText(index.toString(), city.x, city.y);
      this.ctx.shadowBlur = 0;
    });
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  resize() {
    this.setupCanvas();
  }

  exportAsSVG(filename = 'tsp-solution.svg') {
    let svgContent = `<svg width="${this.width}" height="${this.height}" xmlns="http://www.w3.org/2000/svg">`;
    svgContent += `<rect width="100%" height="100%" fill="#0B1426"/>`;
    svgContent += '</svg>';

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
}

// ===== HELPER FUNCTIONS =====
const generateRandomCities = (count, canvas) => {
  const rect = canvas.getBoundingClientRect();
  const margin = 60;
  const cities = [];

  for (let i = 0; i < count; i++) {
    const city = {
      x: margin + Math.random() * (rect.width - 2 * margin),
      y: margin + Math.random() * (rect.height - 2 * margin),
      id: Date.now() + i
    };
    cities.push(city);
  }

  return cities;
};

const exportResults = (data) => {
  const results = {
    ...data,
    bestDistance: data.bestDistance.toFixed(2),
    executionTime: data.executionTime.toFixed(2) + 'ms',
    timestamp: new Date().toISOString()
  };

  const blob = new Blob([JSON.stringify(results, null, 2)], {
    type: 'application/json'
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `tsp-result-${data.cities}-cities-${data.algorithm}.json`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const exportCSV = (data) => {
  const { cities, route, distance, algorithm, executionTime } = data;

  let csvContent = 'City,X,Y,Order\n';

  cities.forEach((city, index) => {
    const routeOrder = route.indexOf(index);
    csvContent += `${index},${city.x.toFixed(2)},${city.y.toFixed(2)},${routeOrder}\n`;
  });

  csvContent += '\n\nMetadata\n';
  csvContent += `Algorithm,${algorithm}\n`;
  csvContent += `Total Distance,${distance.toFixed(2)}\n`;
  csvContent += `Execution Time,${executionTime.toFixed(2)}ms\n`;

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `tsp-solution-${cities.length}-cities.csv`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// ===== MAIN TSP VISUALIZER COMPONENT =====
const TSPVisualizer = () => {
  const [cities, setCities] = useState([]);
  const [bestRoute, setBestRoute] = useState([]);
  const [currentRoute, setCurrentRoute] = useState([]);
  const [bestDistance, setBestDistance] = useState(Infinity);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [algorithm, setAlgorithm] = useState('hybrid');
  const [executionTime, setExecutionTime] = useState(0);
  const [currentExecutionTime, setCurrentExecutionTime] = useState(0);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const optimizationTimerRef = useRef(null);

  // Inicializar renderer
  useEffect(() => {
    if (canvasRef.current) {
      rendererRef.current = new CanvasRenderer(canvasRef.current);

      if (cities.length === 0) {
        const exampleCities = [
          { x: 200, y: 150, id: 'example-0' },
          { x: 400, y: 200, id: 'example-1' },
          { x: 350, y: 350, id: 'example-2' },
          { x: 150, y: 300, id: 'example-3' }
        ];
        const exampleRoute = [0, 1, 2, 3];
        rendererRef.current.drawExample(exampleCities, exampleRoute);
      }
    }
  }, [cities.length]);

  // Timer para mostrar tempo em execução
  useEffect(() => {
    if (isOptimizing) {
      const startTime = Date.now();
      optimizationTimerRef.current = setInterval(() => {
        setCurrentExecutionTime(Date.now() - startTime);
      }, 50);
    } else {
      if (optimizationTimerRef.current) {
        clearInterval(optimizationTimerRef.current);
      }
      setCurrentExecutionTime(0);
    }

    return () => {
      if (optimizationTimerRef.current) {
        clearInterval(optimizationTimerRef.current);
      }
    };
  }, [isOptimizing]);

  // Desenhar quando dados mudarem
  useEffect(() => {
    if (rendererRef.current) {
      if (cities.length > 0) {
        rendererRef.current.draw(cities, currentRoute, {
          showProgress: isOptimizing,
          progress: optimizationProgress
        });
      }
    }
  }, [cities, currentRoute, isOptimizing, optimizationProgress]);

  // Função principal de otimização
  const optimizeRoute = useCallback(async () => {
    if (cities.length < 3) return;

    setIsOptimizing(true);
    setOptimizationProgress(0);
    const startTime = performance.now();

    const algorithms = new TSPAlgorithms(cities);
    let result;

    try {
      switch (algorithm) {
        case 'nearest':
          result = algorithms.nearestNeighbor();
          setOptimizationProgress(100);
          break;
        case 'genetic':
          for (let i = 0; i <= 100; i += 10) {
            setOptimizationProgress(i);
            await new Promise(resolve => setTimeout(resolve, 50));
          }
          result = algorithms.geneticAlgorithm();
          break;
        default: // hybrid
          setOptimizationProgress(30);
          const nnResult = algorithms.nearestNeighbor();
          setCurrentRoute(nnResult.route);
          await new Promise(resolve => setTimeout(resolve, 100));

          setOptimizationProgress(70);
          await new Promise(resolve => setTimeout(resolve, 100));

          result = algorithms.twoOpt(nnResult.route);
          setOptimizationProgress(100);
      }

      const endTime = performance.now();
      const time = endTime - startTime;

      setBestRoute(result.route);
      setBestDistance(result.distance);
      setCurrentRoute(result.route);
      setExecutionTime(time);

      console.log(`✅ ${algorithm}: ${time.toFixed(2)}ms, distância: ${result.distance.toFixed(2)}`);
    } catch (error) {
      console.error('Erro na otimização:', error);
    } finally {
      setTimeout(() => setIsOptimizing(false), 500);
    }
  }, [cities, algorithm]);

  // Adicionar cidade com clique
  const handleCanvasClick = useCallback((e) => {
    if (isOptimizing) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCities(prev => [...prev, { x, y, id: Date.now() }]);
  }, [isOptimizing]);

  // Reset completo
  const reset = useCallback(() => {
    setCities([]);
    setBestRoute([]);
    setCurrentRoute([]);
    setBestDistance(Infinity);
    setExecutionTime(0);
    setOptimizationProgress(0);
  }, []);

  // Gerar cidades aleatórias
  const handleGenerateCities = useCallback((count) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const newCities = generateRandomCities(count, canvas);
    setCities(newCities);
    setBestRoute([]);
    setCurrentRoute([]);
    setBestDistance(Infinity);
    setExecutionTime(0);
    setOptimizationProgress(0);
  }, []);

  // Exportar em diferentes formatos
  const handleExport = useCallback((format = 'json') => {
    switch (format) {
      case 'json':
        exportResults({
          cities: cities.length,
          algorithm,
          bestDistance,
          executionTime,
          route: bestRoute,
          coordinates: cities
        });
        break;

      case 'csv':
        exportCSV({
          cities,
          route: bestRoute,
          distance: bestDistance,
          algorithm,
          executionTime
        });
        break;

      case 'svg':
        if (rendererRef.current) {
          rendererRef.current.exportAsSVG('tsp-solution.svg');
        }
        break;
    }
    setShowExportDropdown(false);
  }, [cities, algorithm, bestDistance, bestRoute, executionTime]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0B1426 0%, #1A2332 50%, #0B1426 100%)',
      color: 'white',
      padding: '24px',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        {/* Header Enterprise */}
        <header style={{
          textAlign: 'center',
          marginBottom: '48px',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          padding: '48px 32px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.35)'
        }}>
          {/* Navigation Buttons */}
          <div style={{
            position: 'absolute',
            top: '24px',
            left: '24px',
            right: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 10
          }}>
            <button
              onClick={() => window.open('https://jrrodrigues.dev', '_blank')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <ArrowLeft size={16} />
              Back to Portfolio
            </button>
            
            <button
              onClick={() => window.open('https://github.com/your-username/tsp-visualizer', '_blank')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <Github size={16} />
              View on GitHub
            </button>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
            fontWeight: '900',
            letterSpacing: '-0.02em',
            marginBottom: '16px',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #3B82F6 50%, #06B6D4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            TSP Enterprise Optimizer
          </h1>
          <p style={{
            fontSize: '1.25rem',
            color: '#D1D5DB',
            fontWeight: '400',
            letterSpacing: '0.025em',
            opacity: '0.9',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Advanced Travelling Salesman Problem solver with enterprise-grade algorithms and real-time visualization
          </p>
        </header>

        {/* Stats Dashboard Enterprise */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginBottom: '48px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '32px 24px',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 10px 15px rgba(0, 0, 0, 0.15)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
              margin: '0 auto 16px',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
            }}>
              <Target size={24} color="white" />
            </div>
            <div style={{
              fontSize: '2.75rem',
              fontWeight: '800',
              marginBottom: '8px',
              textAlign: 'center',
              lineHeight: '1',
              color: '#3B82F6'
            }}>
              {cities.length}
            </div>
            <div style={{
              fontSize: '0.875rem',
              color: '#9CA3AF',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontWeight: '600',
              textAlign: 'center'
            }}>
              Total Cities
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '32px 24px',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 10px 15px rgba(0, 0, 0, 0.15)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
              margin: '0 auto 16px',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}>
              <Zap size={24} color="white" />
            </div>
            <div style={{
              fontSize: '2.75rem',
              fontWeight: '800',
              marginBottom: '8px',
              textAlign: 'center',
              lineHeight: '1',
              color: '#10B981'
            }}>
              {bestDistance === Infinity ? '∞' : Math.round(bestDistance)}
            </div>
            <div style={{
              fontSize: '0.875rem',
              color: '#9CA3AF',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontWeight: '600',
              textAlign: 'center'
            }}>
              Best Distance
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '32px 24px',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 10px 15px rgba(0, 0, 0, 0.15)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
              margin: '0 auto 16px',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
            }}>
              <GitBranch size={24} color="white" />
            </div>
            <div style={{
              fontSize: '1.75rem',
              fontWeight: '800',
              marginBottom: '8px',
              textAlign: 'center',
              lineHeight: '1',
              color: '#8B5CF6'
            }}>
              {algorithm === 'hybrid' ? 'HYBRID' : algorithm.toUpperCase()}
            </div>
            <div style={{
              fontSize: '0.875rem',
              color: '#9CA3AF',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontWeight: '600',
              textAlign: 'center'
            }}>
              Algorithm
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '32px 24px',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 10px 15px rgba(0, 0, 0, 0.15)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
              margin: '0 auto 16px',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
            }}>
              <Clock size={24} color="white" />
            </div>
            <div style={{
              fontSize: '1.75rem',
              fontWeight: '800',
              marginBottom: '8px',
              textAlign: 'center',
              lineHeight: '1',
              color: '#F59E0B'
            }}>
              {isOptimizing ?
                `${currentExecutionTime.toFixed(0)}ms` :
                executionTime > 0 ? `${executionTime.toFixed(0)}ms` : 'Ready'
              }
            </div>
            <div style={{
              fontSize: '0.875rem',
              color: '#9CA3AF',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontWeight: '600',
              textAlign: 'center'
            }}>
              Execution Time
            </div>
          </div>
        </div>

        {/* Controls Enterprise */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          justifyContent: 'center',
          marginBottom: '48px',
          padding: '24px',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          boxShadow: '0 10px 15px rgba(0, 0, 0, 0.15)'
        }}>
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value)}
            disabled={isOptimizing}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(8px)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '16px',
              padding: '16px 20px',
              color: 'white',
              fontSize: '15px',
              fontWeight: '500',
              fontFamily: "'Inter', sans-serif",
              minWidth: '220px',
              cursor: 'pointer'
            }}
          >
            <option value="hybrid" style={{ background: '#1A2332', color: 'white' }}>Hybrid Algorithm (NN + 2-opt)</option>
            <option value="nearest" style={{ background: '#1A2332', color: 'white' }}>Nearest Neighbor</option>
            <option value="genetic" style={{ background: '#1A2332', color: 'white' }}>Genetic Algorithm</option>
          </select>

          <button
            onClick={() => handleGenerateCities(15)}
            disabled={isOptimizing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px 28px',
              fontSize: '15px',
              fontWeight: '600',
              fontFamily: "'Inter', sans-serif",
              border: 'none',
              borderRadius: '16px',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
              color: 'white',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              opacity: isOptimizing ? 0.5 : 1
            }}
          >
            <Plus size={18} />
            Generate 15 Cities
          </button>

          <button
            onClick={() => handleGenerateCities(20)}
            disabled={isOptimizing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px 28px',
              fontSize: '15px',
              fontWeight: '600',
              fontFamily: "'Inter', sans-serif",
              border: 'none',
              borderRadius: '16px',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              opacity: isOptimizing ? 0.5 : 1
            }}
          >
            <Plus size={18} />
            Generate 20 Cities
          </button>

          <button
            onClick={optimizeRoute}
            disabled={cities.length < 3 || isOptimizing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px 28px',
              fontSize: '15px',
              fontWeight: '600',
              fontFamily: "'Inter', sans-serif",
              border: 'none',
              borderRadius: '16px',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
              color: 'white',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              boxShadow: isOptimizing ? '0 0 20px rgba(16, 185, 129, 0.4)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
              opacity: (cities.length < 3 || isOptimizing) ? 0.5 : 1,
              animation: isOptimizing ? 'pulse 1.5s ease-in-out infinite' : 'none'
            }}
          >
            {isOptimizing ? (
              <>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Optimizing... {optimizationProgress.toFixed(0)}%
              </>
            ) : (
              <>
                <Play size={18} />
                Run Optimization
              </>
            )}
          </button>

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              disabled={bestRoute.length === 0}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px 28px',
                fontSize: '15px',
                fontWeight: '600',
                fontFamily: "'Inter', sans-serif",
                border: 'none',
                borderRadius: '16px',
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
                color: 'white',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                opacity: bestRoute.length === 0 ? 0.5 : 1
              }}
            >
              <Download size={18} />
              Export Results
              <ChevronDown size={16} style={{
                transform: showExportDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease'
              }} />
            </button>

            {showExportDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: '0',
                marginTop: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '8px',
                minWidth: '180px',
                zIndex: 1000,
                boxShadow: '0 20px 25px rgba(0, 0, 0, 0.25)'
              }}>
                <button
                  onClick={() => handleExport('json')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '12px 16px',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <FileText size={16} />
                  Export JSON
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '12px 16px',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <FileText size={16} />
                  Export CSV
                </button>
                <button
                  onClick={() => handleExport('svg')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '12px 16px',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <Image size={16} />
                  Export SVG
                </button>
              </div>
            )}
          </div>

          <button
            onClick={reset}
            disabled={isOptimizing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px 28px',
              fontSize: '15px',
              fontWeight: '600',
              fontFamily: "'Inter', sans-serif",
              border: 'none',
              borderRadius: '16px',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
              color: 'white',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              opacity: isOptimizing ? 0.5 : 1
            }}
          >
            <RotateCcw size={18} />
            Reset All
          </button>
        </div>

        {/* Canvas */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          padding: '32px',
          marginBottom: '48px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.35)'
        }}>
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            style={{
              width: '100%',
              height: '600px',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '16px',
              cursor: 'crosshair',
              background: 'linear-gradient(135deg, #0B1426 0%, #1A2332 50%, #0B1426 100%)',
              display: 'block'
            }}
          />
          <p style={{
            textAlign: 'center',
            color: '#9CA3AF',
            marginTop: '24px',
            fontSize: '14px',
            fontWeight: '500',
            letterSpacing: '0.025em',
            lineHeight: '1.5'
          }}>
            {cities.length === 0 ? (
              <>
                Click to add cities • <span style={{ color: '#EF4444' }}>Red city = starting point</span> • Enterprise-grade visualization
              </>
            ) : (
              <>
                Click to add more cities • First city = starting point (red) • {cities.length} cities added
              </>
            )}
          </p>
        </div>

        {/* Algorithm Info Enterprise */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          padding: '48px 32px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.35)'
        }}>
          <h3 style={{
            fontSize: '2.25rem',
            fontWeight: '800',
            marginBottom: '32px',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.01em'
          }}>
            Enterprise Algorithm Suite
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '32px'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              padding: '32px',
              position: 'relative',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              overflow: 'hidden'
            }}>
              <h4 style={{
                fontWeight: '700',
                marginBottom: '16px',
                fontSize: '1.25rem',
                letterSpacing: '-0.01em',
                color: '#10B981'
              }}>
                Hybrid Algorithm (NN + 2-opt)
              </h4>
              <p style={{
                color: '#D1D5DB',
                lineHeight: '1.7',
                fontSize: '15px',
                fontWeight: '400'
              }}>
                Production-ready hybrid approach combining Nearest Neighbor for rapid initial solution
                with 2-opt local optimization. Delivers optimal cost-performance ratio for enterprise applications.
              </p>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              padding: '32px',
              position: 'relative',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              overflow: 'hidden'
            }}>
              <h4 style={{
                fontWeight: '700',
                marginBottom: '16px',
                fontSize: '1.25rem',
                letterSpacing: '-0.01em',
                color: '#3B82F6'
              }}>
                Nearest Neighbor
              </h4>
              <p style={{
                color: '#D1D5DB',
                lineHeight: '1.7',
                fontSize: '15px',
                fontWeight: '400'
              }}>
                High-performance greedy algorithm with O(n²) complexity. Always selects the nearest unvisited city.
                Optimized for speed in time-critical enterprise environments.
              </p>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              padding: '32px',
              position: 'relative',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              overflow: 'hidden'
            }}>
              <h4 style={{
                fontWeight: '700',
                marginBottom: '16px',
                fontSize: '1.25rem',
                letterSpacing: '-0.01em',
                color: '#8B5CF6'
              }}>
                Genetic Algorithm
              </h4>
              <p style={{
                color: '#D1D5DB',
                lineHeight: '1.7',
                fontSize: '15px',
                fontWeight: '400'
              }}>
                Advanced evolutionary computation with tournament selection and order crossover.
                Capable of discovering high-quality solutions for complex optimization scenarios.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.4); }
          50% { box-shadow: 0 0 30px rgba(16, 185, 129, 0.8); }
          100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.4); }
        }
      `}</style>
    </div>
  );
};

export default TSPVisualizer;