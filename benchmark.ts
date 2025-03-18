import { sequentialSearch } from "./sequential-search.ts";
import { binarySearch } from "./binary-search.ts";

// Fonction pour générer un tableau aléatoire de taille donnée
function generateRandomArray(size: number): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * size * 10));
}

// Fonction pour mesurer le temps d'exécution de la recherche séquentielle
function benchmarkSequentialSearch(size: number, iterations: number = 100): number {
  const array = generateRandomArray(size);
  const targets = Array.from({ length: iterations }, () => 
    Math.floor(Math.random() * size * 10));
  
  const start = performance.now();
  for (const target of targets) {
    sequentialSearch(array, target);
  }
  const end = performance.now();
  
  return (end - start) / iterations;
}

// Fonction pour mesurer le temps d'exécution de la recherche binaire (incluant le tri)
function benchmarkBinarySearch(size: number, iterations: number = 100): number {
  const array = generateRandomArray(size);
  const targets = Array.from({ length: iterations }, () => 
    Math.floor(Math.random() * size * 10));
  
  const start = performance.now();
  // Inclure le temps de tri
  const sortedArray = [...array].sort((a, b) => a - b);
  for (const target of targets) {
    binarySearch(sortedArray, target);
  }
  const end = performance.now();
  
  return (end - start) / iterations;
}

// Exécuter les benchmarks pour différentes tailles
const sizes = [100, 1000, 10000, 100000, 1000000];
const sequentialResults: [number, number][] = [];
const binaryResults: [number, number][] = [];

for (const size of sizes) {
  console.log(`Benchmarking for size ${size}...`);
  
  const sequentialTime = benchmarkSequentialSearch(size);
  sequentialResults.push([size, sequentialTime]);
  
  const binaryTime = benchmarkBinarySearch(size);
  binaryResults.push([size, binaryTime]);
  
  console.log(`Sequential search: ${sequentialTime.toFixed(6)} ms`);
  console.log(`Binary search (with sort): ${binaryTime.toFixed(6)} ms`);
  console.log("------------------------------");
}

console.log("Sequential search results:", JSON.stringify(sequentialResults));
console.log("Binary search results:", JSON.stringify(binaryResults));
