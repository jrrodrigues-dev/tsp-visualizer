import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, RotateCcw, Plus, Download, Target, Zap, GitBranch, Clock } from 'lucide-react';
import TSPAlgorithms from '../algorithms/TSPAlgorithms';
import CanvasRenderer from '../utils/CanvasRenderer';
import { exportResults, generateRandomCities } from '../utils/helpers';

const TSPVisualizer = () => {
    const [cities, setCities] = useState([]);
    const [bestRoute, setBestRoute] = useState([]);
    const [currentRoute, setCurrentRoute] = useState([]);
    const [bestDistance, setBestDistance] = useState(Infinity);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [algorithm, setAlgorithm] = useState('hybrid');
    const [executionTime, setExecutionTime] = useState(0);
    const canvasRef = useRef(null);
    const rendererRef = useRef(null);

    // Inicializar renderer
    useEffect(() => {
        if (canvasRef.current) {
            rendererRef.current = new CanvasRenderer(canvasRef.current);
        }
    }, []);

    // Desenhar quando dados mudarem
    useEffect(() => {
        if (rendererRef.current) {
            rendererRef.current.draw(cities, currentRoute);
        }
    }, [cities, currentRoute]);

    // Função principal de otimização
    const optimizeRoute = useCallback(async () => {
        if (cities.length < 3) return;

        setIsOptimizing(true);
        const startTime = performance.now();

        const algorithms = new TSPAlgorithms(cities);
        let result;

        try {
            switch (algorithm) {
                case 'nearest':
                    result = algorithms.nearestNeighbor();
                    break;
                case 'genetic':
                    result = algorithms.geneticAlgorithm();
                    break;
                default: // hybrid
                    result = algorithms.hybrid();
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
            setIsOptimizing(false);
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
    }, []);

    // Exportar resultados
    const handleExport = useCallback(() => {
        exportResults({
            cities: cities.length,
            algorithm,
            bestDistance,
            executionTime,
            route: bestRoute
        });
    }, [cities.length, algorithm, bestDistance, bestRoute, executionTime]);

    return (
        <div className="tsp-container">
            {/* Header */}
            <header className="tsp-header">
                <h1 className="tsp-title">TSP Optimizer</h1>
                <p className="tsp-subtitle">Travelling Salesman Problem com algoritmos avançados</p>
            </header>

            {/* Stats Dashboard */}
            <div className="stats-grid">
                <div className="stat-card">
                    <Target size={24} color="#00f5ff" />
                    <div className="stat-value" style={{ color: '#00f5ff' }}>{cities.length}</div>
                    <div className="stat-label">Cidades</div>
                </div>

                <div className="stat-card">
                    <Zap size={24} color="#00d4aa" />
                    <div className="stat-value" style={{ color: '#00d4aa' }}>
                        {bestDistance === Infinity ? '∞' : Math.round(bestDistance)}
                    </div>
                    <div className="stat-label">Distância</div>
                </div>

                <div className="stat-card">
                    <GitBranch size={24} color="#ff6b6b" />
                    <div className="stat-value" style={{ color: '#ff6b6b', fontSize: '1.8rem' }}>
                        {algorithm === 'hybrid' ? 'NN+2opt' : algorithm.toUpperCase()}
                    </div>
                    <div className="stat-label">Algoritmo</div>
                </div>

                <div className="stat-card">
                    <Clock size={24} color="#ffa726" />
                    <div className="stat-value" style={{ color: '#ffa726', fontSize: '1.8rem' }}>
                        {executionTime > 0 ? `${executionTime.toFixed(0)}ms` : 'Pronto'}
                    </div>
                    <div className="stat-label">Tempo</div>
                </div>
            </div>

            {/* Controls */}
            <div className="controls-container">
                <select
                    value={algorithm}
                    onChange={(e) => setAlgorithm(e.target.value)}
                    className="algorithm-select"
                    disabled={isOptimizing}
                >
                    <option value="hybrid">Híbrido (NN + 2-opt)</option>
                    <option value="nearest">Nearest Neighbor</option>
                    <option value="genetic">Algoritmo Genético</option>
                </select>

                <button
                    onClick={() => handleGenerateCities(15)}
                    disabled={isOptimizing}
                    className="btn btn-primary"
                >
                    <Plus size={16} />
                    15 Cidades
                </button>

                <button
                    onClick={() => handleGenerateCities(20)}
                    disabled={isOptimizing}
                    className="btn btn-secondary"
                >
                    <Plus size={16} />
                    20 Cidades
                </button>

                <button
                    onClick={optimizeRoute}
                    disabled={cities.length < 3 || isOptimizing}
                    className="btn btn-success"
                >
                    {isOptimizing ? (
                        <>
                            <div className="spinner" />
                            Otimizando...
                        </>
                    ) : (
                        <>
                            <Play size={16} />
                            Otimizar
                        </>
                    )}
                </button>

                <button
                    onClick={handleExport}
                    disabled={bestRoute.length === 0}
                    className="btn btn-warning"
                >
                    <Download size={16} />
                    Exportar
                </button>

                <button
                    onClick={reset}
                    disabled={isOptimizing}
                    className="btn btn-danger"
                >
                    <RotateCcw size={16} />
                    Reset
                </button>
            </div>

            {/* Canvas */}
            <div className="canvas-container">
                <canvas
                    ref={canvasRef}
                    onClick={handleCanvasClick}
                    className="tsp-canvas"
                />
                <p className="canvas-hint">
                    Clique para adicionar cidades • Primeira cidade = ponto de partida (vermelho)
                </p>
            </div>

            {/* Algorithm Info */}
            <div className="algorithm-info">
                <h3 className="algorithm-title">Sobre os Algoritmos</h3>
                <div className="algorithm-grid">
                    <div className="algorithm-card">
                        <h4 className="algorithm-card-title" style={{ color: '#00d4aa' }}>
                            Híbrido (NN + 2-opt)
                        </h4>
                        <p className="algorithm-card-text">
                            Combina Nearest Neighbor para solução inicial rápida com 2-opt para otimização local.
                            Melhor custo-benefício para a maioria dos casos.
                        </p>
                    </div>

                    <div className="algorithm-card">
                        <h4 className="algorithm-card-title" style={{ color: '#00f5ff' }}>
                            Nearest Neighbor
                        </h4>
                        <p className="algorithm-card-text">
                            Algoritmo guloso que sempre escolhe a cidade mais próxima não visitada.
                            Muito rápido mas não garante solução ótima.
                        </p>
                    </div>

                    <div className="algorithm-card">
                        <h4 className="algorithm-card-title" style={{ color: '#ff6b6b' }}>
                            Genético
                        </h4>
                        <p className="algorithm-card-text">
                            Simula evolução natural com população de soluções.
                            Pode encontrar soluções muito boas mas é mais lento.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TSPVisualizer;