/**
 * Définition de type pour un graphe pondéré où chaque nœud a des voisins avec des poids associés
 */
type Graph = { [key: string]: { [neighbor: string]: number } };

/**
 * Implémentation d'une file de priorité pour l'algorithme A*
 * Utilise un tableau simple avec tri à chaque insertion
 */
class FileDePriorite<T> {
  private elements: { element: T; priorite: number }[] = [];

  /**
   * Ajouter un élément à la file avec une priorité donnée
   */
  ajouter(element: T, priorite: number) {
    this.elements.push({ element, priorite });
    this.elements.sort((a, b) => a.priorite - b.priorite);
  }

  /**
   * Retirer et renvoyer l'élément avec la priorité la plus basse
   */
  retirer(): T | undefined {
    return this.elements.shift()?.element;
  }

  /**
   * Vérifier si la file est vide
   */
  estVide(): boolean {
    return this.elements.length === 0;
  }
}

/**
 * Calcul d'heuristique pour l'algorithme A* (distance du point final)
 * Dans cet exemple, nous utilisons une heuristique simple basée sur un dictionnaire de coordonnées
 */
const heuristique = (node: string, fin: string, coordonnees: {[ville: string]: {x: number, y: number}}): number => {
  // Si nous n'avons pas de coordonnées, retourner 0 comme estimation neutre
  if (!coordonnees[node] || !coordonnees[fin]) return 0;

  // Calculer la distance euclidienne entre les points
  const dx = coordonnees[node].x - coordonnees[fin].x;
  const dy = coordonnees[node].y - coordonnees[fin].y;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Implémentation de l'algorithme A* pour trouver le chemin le plus court dans un graphe pondéré
 * @param graph - La représentation du graphe pondéré
 * @param depart - Nœud de départ
 * @param fin - Nœud de destination
 * @param coordonnees - Coordonnées des nœuds pour l'heuristique
 * @returns Objet contenant la distance la plus courte et le chemin
 */
const algorithmeAStar = (
  graph: Graph, 
  depart: string, 
  fin: string, 
  coordonnees: {[ville: string]: {x: number, y: number}} = {}
): { distance: number, chemin: string[] } => {
  // Suivre les distances depuis le départ jusqu'à chaque nœud
  const distances: { [key: string]: number } = {};
  // Suivre le nœud précédent dans le chemin optimal
  const precedents: { [key: string]: string | null } = {};
  // File de priorité pour traiter les nœuds par la distance la plus courte estimée
  const file = new FileDePriorite<string>();
  // Score f(n) = g(n) + h(n) pour chaque nœud
  const scoresF: { [key: string]: number } = {};

  // Initialiser les distances à l'infini et les nœuds précédents à null
  for (const noeud in graph) {
    distances[noeud] = Infinity;
    precedents[noeud] = null;
    scoresF[noeud] = Infinity;
  }

  // Distance au nœud de départ est 0
  distances[depart] = 0;
  scoresF[depart] = heuristique(depart, fin, coordonnees);
  file.ajouter(depart, scoresF[depart]);

  while (!file.estVide()) {
    const courant = file.retirer();

    // Si courant est undefined, passer à l'itération suivante
    if (courant === undefined) continue;

    // Si nous avons atteint le nœud final, nous pouvons arrêter
    if (courant === fin) break;

    // Vérifier si le nœud courant existe dans le graphe
    if (!graph[courant]) continue;

    // Vérifier tous les voisins du nœud courant
    for (const voisin in graph[courant]) {
      // Calculer la distance tentative vers le voisin via le nœud courant
      const alt = distances[courant] + graph[courant][voisin];

      // Si nous avons trouvé un meilleur chemin vers le voisin
      if (alt < (distances[voisin] || Infinity)) {
        // Mettre à jour la distance et le nœud précédent
        distances[voisin] = alt;
        precedents[voisin] = courant;

        // Calculer le score f(n) = g(n) + h(n)
        scoresF[voisin] = alt + heuristique(voisin, fin, coordonnees);

        // Ajouter à la file de priorité avec la nouvelle priorité
        file.ajouter(voisin, scoresF[voisin]);
      }
    }
  }

  // Reconstruire le chemin de la fin au départ
  const chemin: string[] = [];
  let actuel: string | null = fin;

  // S'assurer que la fin est atteignable
  if (distances[fin] === undefined || distances[fin] === Infinity) {
    return { distance: Infinity, chemin: [] };
  }

  // Construire le chemin en revenant de la fin au départ
  // Ajouter une détection de cycle pour éviter les boucles infinies
  const visite = new Set<string>();
  while (actuel !== null) {
    // Vérifier les cycles pour éviter les boucles infinies
    if (visite.has(actuel)) {
      console.error("Cycle détecté dans la reconstruction du chemin");
      break;
    }
    visite.add(actuel);

    chemin.unshift(actuel);
    actuel = precedents[actuel] || null;
  }

  return { distance: distances[fin], chemin };
};

// Exemple de graphe avec des arêtes pondérées représentant des villes reliées par des routes avec des distances en kilomètres
const graphe: Graph = {
  "New York": { "Boston": 346, "Washington": 384, "Chicago": 1147 },
  "Boston": { "New York": 346, "Chicago": 1368, "Toronto": 886 },
  "Washington": { "New York": 384, "Atlanta": 868, "Dallas": 1971 },
  "Chicago": { "New York": 1147, "Boston": 1368, "Denver": 1635, "Los Angeles": 3017 },
  "Toronto": { "Boston": 886, "Chicago": 764, "Seattle": 4173 },
  "Atlanta": { "Washington": 868, "Dallas": 1171, "Miami": 975 },
  "Dallas": { "Washington": 1971, "Atlanta": 1171, "Los Angeles": 2205 },
  "Denver": { "Chicago": 1635, "Seattle": 1645, "San Francisco": 1967 },
  "Seattle": { "Toronto": 4173, "Denver": 1645, "San Francisco": 1298 },
  "Los Angeles": { "Chicago": 3017, "Dallas": 2205, "San Francisco": 617 },
  "San Francisco": { "Denver": 1967, "Seattle": 1298, "Los Angeles": 617 },
  "Miami": { "Atlanta": 975 }
};

// Coordonnées fictives des villes pour l'heuristique
const coordonnees = {
  "New York": { x: 74, y: 40 },
  "Boston": { x: 71, y: 42 },
  "Washington": { x: 77, y: 38 },
  "Chicago": { x: 87, y: 41 },
  "Toronto": { x: 79, y: 43 },
  "Atlanta": { x: 84, y: 33 },
  "Dallas": { x: 96, y: 32 },
  "Denver": { x: 104, y: 39 },
  "Seattle": { x: 122, y: 47 },
  "Los Angeles": { x: 118, y: 34 },
  "San Francisco": { x: 122, y: 37 },
  "Miami": { x: 80, y: 25 }
};

// Trouver le chemin le plus court de New York à San Francisco
const resultat = algorithmeAStar(graphe, "New York", "San Francisco", coordonnees);
console.log("Distance minimale :", resultat.distance);
console.log("Chemin :", resultat.chemin);