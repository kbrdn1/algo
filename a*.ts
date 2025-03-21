// Définition de la structure du nœud pour A*
interface Node {
  x: number;
  y: number;
  f: number; // coût total = g + h
  g: number; // coût du chemin depuis le départ
  h: number; // heuristique (distance estimée jusqu'à l'arrivée)
  parent: Node | null;
}

// Fonction pour créer un nouveau nœud
function createNode(x: number, y: number, parent: Node | null = null): Node {
  return {
    x,
    y,
    f: 0,
    g: 0,
    h: 0,
    parent
  };
}

// Fonction pour calculer la distance de Manhattan (heuristique)
function heuristic(a: Node, b: Node): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

// Fonction principale A*
function aStar(grid: number[][], start: [number, number], goal: [number, number]): Node[] | null {
  const rows = grid.length;
  if (rows === 0) return null;
  
  const cols = grid[0]?.length || 0;
  if (cols === 0) return null;
  
  // Directions possibles (haut, droite, bas, gauche)
  const directions: [number, number][] = [[-1, 0], [0, 1], [1, 0], [0, -1]];
  
  // Nœuds de départ et d'arrivée
  const startNode = createNode(start[0], start[1]);
  const goalNode = createNode(goal[0], goal[1]);
  
  // Listes ouverte et fermée
  const openList: Node[] = [];
  const closedList: Set<string> = new Set();
  
  // Ajouter le nœud de départ à la liste ouverte
  openList.push(startNode);
  
  // Tant que la liste ouverte n'est pas vide
  while (openList.length > 0) {
    // Trouver le nœud avec le coût f le plus bas
    let currentIndex = 0;
    for (let i = 0; i < openList.length; i++) {
      if (openList[i] && openList[currentIndex] && openList[i].f < openList[currentIndex].f) {
        currentIndex = i;
      }
    }
    
    // Nœud courant
    const currentNode = openList[currentIndex];
    
    // Vérifier que le nœud courant existe
    if (!currentNode) {
      continue; // Passer à l'itération suivante si le nœud n'existe pas
    }
    
    // Si nous avons atteint le but, reconstruire le chemin
    if (currentNode.x === goalNode.x && currentNode.y === goalNode.y) {
      const path: Node[] = [];
      let current: Node | null = currentNode;
      
      while (current !== null) {
        path.unshift(current);
        current = current.parent;
      }
      
      return path;
    }
    
    // Retirer le nœud courant de la liste ouverte et l'ajouter à la liste fermée
    openList.splice(currentIndex, 1);
    closedList.add(`${currentNode.x},${currentNode.y}`);
    
    // Explorer les voisins
    for (const [dx, dy] of directions) {
      const newX = currentNode.x + dx;
      const newY = currentNode.y + dy;
      
      // Vérifier si le voisin est valide
      if (
        newX < 0 || newX >= rows ||
        newY < 0 || newY >= cols ||
        grid[newX]?.[newY] === 1 || // 1 représente un obstacle
        closedList.has(`${newX},${newY}`)
      ) {
        continue;
      }
      
      // Créer un nouveau nœud
      const neighbor = createNode(newX, newY, currentNode);
      
      // Calculer les coûts
      neighbor.g = currentNode.g + 1; // Coût de déplacement uniforme
      neighbor.h = heuristic(neighbor, goalNode);
      neighbor.f = neighbor.g + neighbor.h;
      
      // Vérifier si ce voisin est déjà dans la liste ouverte avec un meilleur score
      const existingNodeIndex = openList.findIndex(node => node.x === newX && node.y === newY);
      
      if (existingNodeIndex !== -1 && openList[existingNodeIndex]?.g <= neighbor.g) {
        continue;
      }
      
      // Ajouter le voisin à la liste ouverte
      if (existingNodeIndex === -1) {
        openList.push(neighbor);
      } else {
        openList[existingNodeIndex] = neighbor;
      }
    }
  }
  
  // Aucun chemin trouvé
  return null;
}

// Correction pour l'algorithme de Dijkstra
function dijkstra(graph: Record<string, Record<string, number>>, debut: string, fin: string): { distance: number, chemin: string[] } {
  // Ensemble des nœuds non visités
  const nonVisites: Set<string> = new Set(Object.keys(graph));
  
  // Distances initiales depuis le nœud de départ
  const distances: Record<string, number> = {};
  
  // Nœuds précédents dans le chemin optimal
  const precedents: Record<string, string | null> = {};
  
  // Initialiser les distances à l'infini et les précédents à null
  for (const noeud of nonVisites) {
    distances[noeud] = Infinity;
    precedents[noeud] = null;
  }
  
  // La distance du nœud de départ à lui-même est 0
  distances[debut] = 0;
  
  // Tant qu'il reste des nœuds non visités
  while (nonVisites.size > 0) {
    // Trouver le nœud non visité avec la plus petite distance
    let courant: string | null = null;
    let distanceMin = Infinity;
    
    for (const noeud of nonVisites) {
      if (distances[noeud] < distanceMin) {
        distanceMin = distances[noeud];
        courant = noeud;
      }
    }
    
    // Si aucun nœud accessible n'a été trouvé
    if (courant === null || distances[courant] === Infinity) {
      break;
    }
    
    // Si nous avons atteint le nœud final
    if (courant === fin) {
      break;
    }
    
    // Retirer le nœud courant des nœuds non visités
    nonVisites.delete(courant);
    
    // Pour chaque voisin du nœud courant
    if (graph[courant]) {
      for (const voisin in graph[courant]) {
        if (graph[courant][voisin] !== undefined) {
          // Calculer la distance tentative vers le voisin via le nœud courant
          const alt = distances[courant] + graph[courant][voisin];
          
          // Si nous avons trouvé un meilleur chemin vers le voisin
          if (alt < distances[voisin]) {
            distances[voisin] = alt;
            precedents[voisin] = courant;
          }
        }
      }
    }
  }
  
  // Reconstruire le chemin
  const chemin: string[] = [];
  let courant: string | null = fin;
  
  if (precedents[fin] !== undefined || fin === debut) {
    while (courant !== null) {
      chemin.unshift(courant);
      courant = precedents[courant];
    }
  }
  
  return {
    distance: distances[fin],
    chemin
  };
}

// Exemple d'utilisation
const grid = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 0, 0, 1, 0, 1, 0],
  [0, 0, 0, 1, 0, 0, 0, 0, 1, 0],
  [1, 1, 0, 1, 0, 1, 1, 0, 1, 0],
  [0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
  [0, 1, 1, 1, 1, 0, 1, 1, 1, 0],
  [0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
  [0, 1, 1, 0, 1, 1, 1, 1, 0, 1],
  [0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 1, 0, 1, 1, 0, 0]
];

const start: [number, number] = [0, 0];
const goal: [number, number] = [4, 4];

const path = aStar(grid, start, goal);

if (path) {
  console.log("Chemin trouvé:");
  path.forEach(node => {
    console.log(`(${node.x}, ${node.y})`);
  });
} else {
  console.log("Aucun chemin trouvé.");
}
