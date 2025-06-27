/**
 * Exportar resultados para arquivo CSV
 */
export const exportCSV = (data) => {
    const { cities, route, distance, algorithm, executionTime } = data;

    let csvContent = 'City,X,Y,Order\n';

    // Add city data with route order
    cities.forEach((city, index) => {
        const routeOrder = route.indexOf(index);
        csvContent += `${index},${city.x.toFixed(2)},${city.y.toFixed(2)},${routeOrder}\n`;
    });

    // Add metadata
    csvContent += '\n\nMetadata\n';
    csvContent += `Algorithm,${algorithm}\n`;
    csvContent += `Total Distance,${distance.toFixed(2)}\n`;
    csvContent += `Execution Time,${executionTime.toFixed(2)}ms\n`;
    csvContent += `Cities Count,${cities.length}\n`;
    csvContent += `Timestamp,${new Date().toISOString()}\n`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tsp-solution-${cities.length}-cities.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log('📊 CSV exportado:', data);
};/**
   * Funções auxiliares para o TSP Visualizer
   */

/**
 * Gerar cidades aleatórias no canvas
 */
export const generateRandomCities = (count, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const margin = 60; // Margem das bordas
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

/**
 * Exportar resultados para arquivo JSON
 */
export const exportResults = (data) => {
    const results = {
        ...data,
        bestDistance: data.bestDistance.toFixed(2),
        executionTime: data.executionTime.toFixed(2) + 'ms',
        timestamp: new Date().toISOString(),
        metadata: {
            browser: navigator.userAgent,
            performance: {
                cities: data.cities,
                algorithm: data.algorithm,
                timePerCity: (data.executionTime / data.cities).toFixed(2) + 'ms'
            }
        }
    };

    const blob = new Blob([JSON.stringify(results, null, 2)], {
        type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tsp-result-${data.cities}-cities-${data.algorithm}.json`;

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Cleanup
    URL.revokeObjectURL(url);

    console.log('📁 Resultados exportados:', results);
};

/**
 * Validar se as cidades são válidas
 */
export const validateCities = (cities) => {
    if (!Array.isArray(cities)) return false;
    if (cities.length < 3) return false;

    return cities.every(city =>
        city &&
        typeof city.x === 'number' &&
        typeof city.y === 'number' &&
        city.x >= 0 &&
        city.y >= 0
    );
};

/**
 * Calcular estatísticas da solução
 */
export const calculateStats = (cities, route, distance, executionTime) => {
    if (!validateCities(cities) || !route.length) {
        return null;
    }

    const stats = {
        cities: cities.length,
        distance: distance.toFixed(2),
        executionTime: executionTime.toFixed(2) + 'ms',
        avgDistancePerCity: (distance / cities.length).toFixed(2),
        performance: {
            timePerCity: (executionTime / cities.length).toFixed(2) + 'ms',
            isSubSecond: executionTime < 1000,
            rating: getRatingByPerformance(cities.length, executionTime)
        }
    };

    return stats;
};

/**
 * Avaliar performance do algoritmo
 */
const getRatingByPerformance = (cityCount, executionTime) => {
    if (cityCount <= 15 && executionTime < 1000) return 'Excelente';
    if (cityCount <= 20 && executionTime < 5000) return 'Bom';
    if (executionTime < 10000) return 'Aceitável';
    return 'Lento';
};

/**
 * Formatar tempo de execução
 */
export const formatExecutionTime = (timeMs) => {
    if (timeMs < 1000) {
        return `${timeMs.toFixed(0)}ms`;
    } else {
        return `${(timeMs / 1000).toFixed(1)}s`;
    }
};

/**
 * Gerar cores para diferentes algoritmos
 */
export const getAlgorithmColor = (algorithm) => {
    const colors = {
        'hybrid': '#00d4aa',
        'nearest': '#00f5ff',
        'genetic': '#ff6b6b'
    };

    return colors[algorithm] || '#ffffff';
};

/**
 * Debounce para otimizar performance
 */
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};