// Définition des structures
interface City {
  id: number;
  x: number;
  y: number;
  name?: string;
}

interface Route {
  cities: number[];
  distance: number;
  fitness: number;
}

class TSPGeneticAlgorithm {
  private cities: City[];
  private populationSize: number;
  private mutationRate: number;
  private elitismCount: number;
  private tournamentSize: number;
  private population: Route[];
  private startCityId: number;

  constructor(
    cities: City[],
    populationSize: number = 50,
    mutationRate: number = 0.01,
    elitismCount: number = 5,
    tournamentSize: number = 5,
    startCityId: number = 0
  ) {
    this.cities = cities;
    this.populationSize = populationSize;
    this.mutationRate = mutationRate;
    this.elitismCount = elitismCount;
    this.tournamentSize = tournamentSize;
    this.startCityId = startCityId;
    this.population = [];
  }

  // Calcule la distance entre deux villes
  private calculateDistance(city1: City, city2: City): number {
    const dx = city1.x - city2.x;
    const dy = city1.y - city2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Calcule la distance totale d'un parcours
  private calculateTotalDistance(route: number[]): number {
    let totalDistance = 0;
    for (let i = 0; i < route.length - 1; i++) {
      const city1 = this.cities.find(c => c.id === route[i]);
      const city2 = this.cities.find(c => c.id === route[i + 1]);
      
      if (city1 && city2) {
        totalDistance += this.calculateDistance(city1, city2);
      }
    }
    return totalDistance;
  }

  // Initialise une population aléatoire
  private initializePopulation(): void {
    this.population = [];
    
    for (let i = 0; i < this.populationSize; i++) {
      // Créer un parcours aléatoire en partant et revenant à la ville de départ
      const cityIds = this.cities.map(city => city.id)
        .filter(id => id !== this.startCityId);
      
      // Mélanger les villes (sauf la ville de départ)
      for (let j = cityIds.length - 1; j > 0; j--) {
        const k = Math.floor(Math.random() * (j + 1));
        // Assurons-nous que les indices j et k sont valides
        if (cityIds[j] !== undefined && cityIds[k] !== undefined) {
          [cityIds[j], cityIds[k]] = [cityIds[k], cityIds[j]];
        }
      }
      
      // Ajouter la ville de départ au début et à la fin
      const route = [this.startCityId, ...cityIds, this.startCityId];
      const distance = this.calculateTotalDistance(route);
      const fitness = 1 / distance;
      
      this.population.push({ cities: route, distance, fitness });
    }
  }

  // Sélection par tournoi
  private tournamentSelection(): Route {
    const tournament: Route[] = [];
    for (let i = 0; i < this.tournamentSize; i++) {
      const randomIndex = Math.floor(Math.random() * this.population.length);
      const selectedRoute = this.population[randomIndex];
      if (selectedRoute) {
        tournament.push(selectedRoute);
      }
    }
    
    if (tournament.length === 0) {
      // Fallback au cas où le tournoi serait vide
      return this.population[0] || {
        cities: [this.startCityId, this.startCityId],
        distance: 0,
        fitness: 0
      };
    }
    
    return tournament.reduce((best, current) => 
      current.fitness > best.fitness ? current : best, tournament[0]);
  }

  // Croisement (Order Crossover)
  private crossover(parent1: Route, parent2: Route): Route {
    const route = Array(parent1.cities.length).fill(-1);
    
    // Garder la ville de départ/arrivée fixe
    route[0] = this.startCityId;
    route[route.length - 1] = this.startCityId;
    
    // Sélectionner des points de croisement aléatoires
    const start = Math.floor(Math.random() * (route.length - 2)) + 1;
    const end = Math.floor(Math.random() * (route.length - start - 1)) + start;
    
    // Copier une sous-séquence du premier parent
    for (let i = start; i <= end; i++) {
      route[i] = parent1.cities[i];
    }
    
    // Remplir le reste avec les villes du second parent dans l'ordre
    let j = 1;
    for (let i = 1; i < parent2.cities.length - 1; i++) {
      if (!route.includes(parent2.cities[i])) {
        while (j < route.length - 1 && route[j] !== -1) {
          j++;
        }
        if (j < route.length - 1) {
          route[j] = parent2.cities[i];
        }
      }
    }
    
    const distance = this.calculateTotalDistance(route);
    return { cities: route, distance, fitness: 1 / distance };
  }

  // Mutation (permutation de deux villes ou inversion de séquence)
  private mutate(route: Route): Route {
    const newRoute = [...route.cities];
    
    if (Math.random() < 0.5) {
      // Permutation de deux villes
      const idCity1 = Math.floor(Math.random() * (newRoute.length - 2)) + 1;
      const idCity2 = Math.floor(Math.random() * (newRoute.length - 2)) + 1;
      
      if (newRoute[idCity1] !== undefined && newRoute[idCity2] !== undefined) {
        const temp = newRoute[idCity1];
        newRoute[idCity1] = newRoute[idCity2];
        newRoute[idCity2] = temp;
      }
    } else {
      // Inversion de séquence
      const start = Math.floor(Math.random() * (newRoute.length - 3)) + 1;
      const end = Math.floor(Math.random() * (newRoute.length - start - 1)) + start;
      
      // Inverser la séquence
      const subArray = newRoute.slice(start, end + 1).reverse();
      for (let i = 0; i <= end - start; i++) {
        if (subArray[i] !== undefined) {
          newRoute[start + i] = subArray[i];
        }
      }
    }
    
    const distance = this.calculateTotalDistance(newRoute);
    return { cities: newRoute, distance, fitness: 1 / distance };
  }

  // Évolution
  private evolve(): void {
    // Trier par fitness (décroissant)
    this.population.sort((a, b) => b.fitness - a.fitness);
    
    const newPopulation: Route[] = [];
    
    // Élitisme: conserver les meilleures routes
    for (let i = 0; i < this.elitismCount && i < this.population.length; i++) {
      if (this.population[i]) {
        newPopulation.push(this.population[i]);
      }
    }
    
    // Créer le reste de la population par croisement et mutation
    while (newPopulation.length < this.populationSize) {
      const parent1 = this.tournamentSelection();
      const parent2 = this.tournamentSelection();
      
      let offspring = this.crossover(parent1, parent2);
      
      // Appliquer la mutation selon le taux
      if (Math.random() < this.mutationRate) {
        offspring = this.mutate(offspring);
      }
      
      newPopulation.push(offspring);
    }
    
    this.population = newPopulation;
  }

  // Exécution de l'algorithme génétique
  public run(generations: number): Route {
    // Initialiser la population
    this.initializePopulation();
    
    // Exécuter l'évolution sur plusieurs générations
    for (let i = 0; i < generations; i++) {
      this.evolve();
    }
    
    // Trier une dernière fois et retourner la meilleure route
    this.population.sort((a, b) => b.fitness - a.fitness);
    
    // Retourner la meilleure route, ou une route par défaut si la population est vide
    return this.population[0] || {
      cities: [this.startCityId, this.startCityId],
      distance: 0,
      fitness: 0
    };
  }
}

// Utilisation de l'algorithme
const cities: City[] = [
  { id: 0, x: 2.3488, y: 48.8534, name: "Paris" },
  { id: 1, x: 4.8357, y: 45.7640, name: "Lyon" },
  { id: 2, x: 5.3698, y: 43.2965, name: "Marseille" },
  { id: 3, x: -0.5792, y: 44.8378, name: "Bordeaux" },
  { id: 4, x: 3.0573, y: 50.6292, name: "Lille" },
  { id: 5, x: 7.7521, y: 48.5734, name: "Strasbourg" },
  { id: 6, x: 1.4442, y: 43.6047, name: "Toulouse" },
  { id: 7, x: -1.5534, y: 47.2173, name: "Nantes" },
  { id: 8, x: 7.2620, y: 43.7102, name: "Nice" },
  { id: 9, x: -1.6779, y: 48.1173, name: "Rennes" },
  { id: 10, x: 3.8767, y: 43.6108, name: "Montpellier" }
];

// Créer et exécuter l'algorithme
const colors = {
  cyan: "\x1b[1;36m%s\x1b[0m",
  yellow: "\x1b[1;33m%s\x1b[0m",
  yellowLight: "\x1b[33m  • %s\x1b[0m",
  purple: "\x1b[1;35m%s\x1b[0m",
  purpleLight: "\x1b[35m  • %s\x1b[0m"
};

console.log(colors.cyan, "╔═══════════════════════════════════════════════════════════╗");
console.log(colors.cyan, "║  ALGORITHME GÉNÉTIQUE POUR LE PROBLÈME DU VOYAGEUR        ║");
console.log(colors.cyan, "╚═══════════════════════════════════════════════════════════╝");

console.log("\n" + colors.yellow, "📍 LISTE DES VILLES:");
cities.forEach(city => console.log(colors.yellowLight, city.name));

// Définition des paramètres de l'algorithme
const populationSize = 100;
const mutationRate = 0.02;
const elitismCount = 10;
const tournamentSize = 5;
const startCityId = 0;
const generations = 3000;

console.log("\n" + colors.purple, "⚙️ PARAMÈTRES DE L'ALGORITHME:");
console.log(colors.purpleLight, "Taille de la population: " + populationSize);
console.log(colors.purpleLight, "Taux de mutation: " + mutationRate);
console.log(colors.purpleLight, "Nombre d'élites: " + elitismCount);
console.log(colors.purpleLight, "Taille du tournoi: " + tournamentSize);
console.log(colors.purpleLight, "Ville de départ: " + cities.find(c => c.id === startCityId)?.name + " (ID: " + startCityId + ")");

console.log("\n\x1b[1;32m%s\x1b[0m", "🚀 LANCEMENT DE L'ALGORITHME...");
const tspSolver = new TSPGeneticAlgorithm(cities, populationSize, mutationRate, elitismCount, tournamentSize, startCityId);

console.log("\x1b[32m%s\x1b[0m", `⏳ Recherche de la meilleure route sur ${generations} générations...`);
const bestRoute = tspSolver.run(generations);

console.log("\n\x1b[1;34m%s\x1b[0m", "🏆 RÉSULTAT FINAL:");
console.log("\x1b[34m  • Itinéraire: %s\x1b[0m", bestRoute.cities.map(id => cities.find(c => c.id === id)?.name).join(" → "));
console.log("\x1b[34m  • Distance totale: \x1b[1m%s\x1b[0m", bestRoute.distance.toFixed(2) + " km");
