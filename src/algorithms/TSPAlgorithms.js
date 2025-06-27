/**
 * Classe com implementações dos algoritmos TSP
 */
class TSPAlgorithms {
    constructor(cities) {
        this.cities = cities;
    }

    /**
     * Calcula distância euclidiana entre duas cidades
     */
    calculateDistance(city1, city2) {
        const dx = city1.x - city2.x;
        const dy = city1.y - city2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Calcula distância total de uma rota
     */
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

    /**
     * Algoritmo Nearest Neighbor
     * Complexidade: O(n²)
     */
    nearestNeighbor() {
        if (this.cities.length < 2) return { route: [], distance: 0 };

        const unvisited = new Set([...Array(this.cities.length).keys()]);
        const route = [0]; // Começar da primeira cidade
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

    /**
     * Algoritmo 2-opt para otimização local
     * Complexidade: O(n²) por iteração
     */
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
                    if (j - i === 1) continue; // Skip adjacent edges

                    // Create new route by reversing segment between i and j
                    const newRoute = [...bestRoute];
                    const segment = newRoute.slice(i, j + 1).reverse();
                    newRoute.splice(i, j - i + 1, ...segment);

                    const newDistance = this.calculateTotalDistance(newRoute);

                    if (newDistance < bestDistance) {
                        bestRoute = newRoute;
                        bestDistance = newDistance;
                        improved = true;
                        break; // Early exit for better performance
                    }
                }
                if (improved) break;
            }
        }

        return {
            route: bestRoute,
            distance: bestDistance
        };
    }

    /**
     * Algoritmo Genético
     * Complexidade: O(g * p * n) onde g=gerações, p=população, n=cidades
     */
    geneticAlgorithm() {
        const populationSize = Math.min(100, Math.max(20, this.cities.length * 3));
        const generations = Math.min(200, this.cities.length * 8);
        const mutationRate = 0.02;
        const eliteSize = Math.floor(populationSize * 0.2);
        const tournamentSize = 5;

        // Criar população inicial
        let population = this.initializePopulation(populationSize);

        for (let gen = 0; gen < generations; gen++) {
            // Avaliar fitness de toda população
            const fitness = population.map(route => ({
                route: [...route],
                distance: this.calculateTotalDistance(route)
            }));

            // Ordenar por fitness (menor distância = melhor)
            fitness.sort((a, b) => a.distance - b.distance);

            // Elite (melhores soluções passam direto)
            const newPopulation = fitness
                .slice(0, eliteSize)
                .map(individual => [...individual.route]);

            // Gerar resto da população através de reprodução
            while (newPopulation.length < populationSize) {
                const parent1 = this.tournamentSelection(fitness, tournamentSize);
                const parent2 = this.tournamentSelection(fitness, tournamentSize);

                const child = this.orderCrossover(parent1.route, parent2.route);

                // Mutação
                if (Math.random() < mutationRate) {
                    this.mutate(child);
                }

                newPopulation.push(child);
            }

            population = newPopulation;
        }

        // Retornar melhor solução final
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

    /**
     * Algoritmo Híbrido: NN + 2-opt
     * Melhor custo-benefício
     */
    hybrid() {
        // Primeira fase: Nearest Neighbor para solução inicial rápida
        const nnResult = this.nearestNeighbor();

        // Segunda fase: 2-opt para otimização local
        const optimizedResult = this.twoOpt(nnResult.route);

        return optimizedResult;
    }

    // ==================== MÉTODOS AUXILIARES ====================

    /**
     * Inicializar população para algoritmo genético
     */
    initializePopulation(size) {
        const population = [];

        for (let i = 0; i < size; i++) {
            const route = [...Array(this.cities.length).keys()];

            // Shuffle Fisher-Yates
            for (let j = route.length - 1; j > 0; j--) {
                const k = Math.floor(Math.random() * (j + 1));
                [route[j], route[k]] = [route[k], route[j]];
            }

            population.push(route);
        }

        return population;
    }

    /**
     * Seleção por torneio
     */
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

    /**
     * Order Crossover (OX1)
     */
    orderCrossover(parent1, parent2) {
        const length = parent1.length;
        const start = Math.floor(Math.random() * length);
        const end = Math.floor(Math.random() * (length - start)) + start;

        const child = new Array(length).fill(-1);

        // Copiar segmento do parent1
        for (let i = start; i <= end; i++) {
            child[i] = parent1[i];
        }

        // Preencher resto com parent2
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

    /**
     * Mutação por swap
     */
    mutate(route) {
        const i = Math.floor(Math.random() * route.length);
        const j = Math.floor(Math.random() * route.length);
        [route[i], route[j]] = [route[j], route[i]];
    }
}

export default TSPAlgorithms;