// Implémentation de l'algorithme génétique pour l'ordonnancement des examens
import type { Subject, Student } from './types';

// Représentation d'une solution - chromosome
class ExamSchedule {
  schedule: Map<string, number>;
  fitness: number;

  constructor(subjects: string[]) {
    this.schedule = new Map<string, number>();
    this.fitness = Infinity;

    // Initialisation aléatoire
    subjects.forEach(subject => {
      this.schedule.set(subject, Math.floor(Math.random() * subjects.length));
    });
  }

  // Évalue la qualité de la solution
  evaluate(subjects: Subject[], students: Student[]): number {
    // Vérifier les contraintes
    let valid = true;

    for (const student of students) {
      const slots = new Set<number>();
      for (const subject of student.subjects) {
        if (this.schedule.has(subject)) {
          const slot = this.schedule.get(subject)!;
          if (slots.has(slot)) {
            valid = false;
            break;
          }
          slots.add(slot);
        }
      }
      if (!valid) break;
    }

    if (!valid) {
      this.fitness = Infinity;
      return Infinity;
    }

    // Calculer le temps total
    const maxSlot = Math.max(...Array.from(this.schedule.values()));
    let totalTime = 0;

    for (let slot = 0; slot <= maxSlot; slot++) {
      let maxDuration = 0;
      for (const [subject, assignedSlot] of this.schedule.entries()) {
        if (assignedSlot === slot) {
          const subjectObj = subjects.find(s => s.name === subject);
          if (subjectObj) {
            maxDuration = Math.max(maxDuration, subjectObj.duration);
          }
        }
      }
      totalTime += maxDuration;
    }

    this.fitness = totalTime;
    return totalTime;
  }

  // Croise avec un autre chromosome
  crossover(other: ExamSchedule): ExamSchedule {
    const child = new ExamSchedule([]);
    const subjects = Array.from(this.schedule.keys());

    const crossPoint = Math.floor(Math.random() * subjects.length);

    subjects.forEach((subject, index) => {
      if (index < crossPoint) {
        child.schedule.set(subject, this.schedule.get(subject)!);
      } else {
        child.schedule.set(subject, other.schedule.get(subject)!);
      }
    });

    return child;
  }

  // Mutation
  mutate(mutationRate: number): void {
    const subjects = Array.from(this.schedule.keys());
    const maxSlot = Math.max(...Array.from(this.schedule.values()));

    subjects.forEach(subject => {
      if (Math.random() < mutationRate) {
        this.schedule.set(subject, Math.floor(Math.random() * (maxSlot + 2)));
      }
    });
  }

  clone(): ExamSchedule {
    const clone = new ExamSchedule([]);
    this.schedule.forEach((slot, subject) => {
      clone.schedule.set(subject, slot);
    });
    clone.fitness = this.fitness;
    return clone;
  }
}

interface Planning {
  totalTime: number;
  schedule: Map<string, number>;
  timeSlots: { 
    slot: number; 
    subjects: string[]; 
    duration: number;
    startTime: string;
    endTime: string;
  }[];
  affectedStudents: Map<string, string[]>;  // Matière -> Liste d'étudiants
}

export function scheduleExamsGenetic(subjects: Subject[], students: Student[], 
                              populationSize = 100, generations = 100, 
                              mutationRate = 0.1): Planning {
  // Initialiser la population
  const subjectNames = subjects.map(s => s.name);
  let population: ExamSchedule[] = [];

  for (let i = 0; i < populationSize; i++) {
    const chromosome = new ExamSchedule(subjectNames);
    chromosome.evaluate(subjects, students);
    population.push(chromosome);
  }

  let bestSolution = population.length > 0 ? population[0].clone() : new ExamSchedule(subjectNames);
  bestSolution.fitness = Infinity;

  // Algorithme génétique principal
  for (let gen = 0; gen < generations; gen++) {
    // Sélection par tournoi
    const selected: ExamSchedule[] = [];

    for (let i = 0; i < populationSize; i++) {
      const idx1 = Math.floor(Math.random() * population.length);
      const idx2 = Math.floor(Math.random() * population.length);

      if (population[idx1]?.fitness < population[idx2]?.fitness) {
        selected.push(population[idx1]!.clone());
      } else {
        selected.push(population[idx2]!.clone());
      }
    }

    // Croisement et mutation
    const newPopulation: ExamSchedule[] = [];

    while (newPopulation.length < populationSize) {
      const parent1 = selected[Math.floor(Math.random() * selected.length)];
      const parent2 = selected[Math.floor(Math.random() * selected.length)];

      if (parent1 && parent2) {
        const child = parent1.crossover(parent2);
        child.mutate(mutationRate);
        child.evaluate(subjects, students);

        newPopulation.push(child);

        if (child.fitness < bestSolution.fitness) {
          bestSolution = child.clone();
          console.log(`Génération ${gen}: Nouvelle meilleure solution trouvée - ${bestSolution.fitness} heures`);
        }
      }
    }

    population = newPopulation;
  }

  // Créer un mapping des matières aux étudiants concernés
  const affectedStudents: Map<string, string[]> = new Map();
  subjectNames.forEach(subject => {
    const studentsForSubject = students
      .filter(student => student.subjects.includes(subject))
      .map(student => student.name);
    affectedStudents.set(subject, studentsForSubject);
  });

  // Générer le planning complet avec des horaires réels
  const schedule = bestSolution.schedule;
  const maxSlot = Math.max(...Array.from(schedule.values()));
  const timeSlots: { 
    slot: number; 
    subjects: string[]; 
    duration: number;
    startTime: string;
    endTime: string;
  }[] = [];

  // Configuration pour assurer des horaires raisonnables
  const startHour = 8; // Commencer à 8h00
  const maxHoursPerDay = 10; // Maximum 10h d'examen par jour
  const breakDuration = 30; // 30 minutes de pause entre les examens
  const examsPerDay = 4; // 4 créneaux d'examen par jour

  let currentDay = 1;
  let currentSlotInDay = 1;
  let currentStartTime = new Date();
  currentStartTime.setHours(startHour, 0, 0, 0);

  for (let slot = 0; slot <= maxSlot; slot++) {
    const slotSubjects: string[] = [];
    let maxDuration = 0;

    for (const [subject, assignedSlot] of schedule.entries()) {
      if (assignedSlot === slot) {
        slotSubjects.push(subject);
        const subjectObj = subjects.find(s => s.name === subject);
        if (subjectObj) {
          maxDuration = Math.max(maxDuration, subjectObj.duration);
        }
      }
    }

    if (slotSubjects.length > 0) {
      // Calculer l'heure de fin
      const endTime = new Date(currentStartTime);
      endTime.setHours(currentStartTime.getHours() + maxDuration);

      // Formatter les heures
      const startTimeStr = `${currentStartTime.getHours().toString().padStart(2, '0')}:${currentStartTime.getMinutes().toString().padStart(2, '0')}`;
      const endTimeStr = `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;

      timeSlots.push({
        slot,
        subjects: slotSubjects,
        duration: maxDuration,
        startTime: startTimeStr,
        endTime: endTimeStr
      });

      // Mettre à jour l'heure de début pour le prochain créneau
      currentStartTime = new Date(endTime);
      currentStartTime.setMinutes(currentStartTime.getMinutes() + breakDuration);

      // Passer au jour suivant si on atteint le nombre max de créneaux par jour
      currentSlotInDay++;
      if (currentSlotInDay > examsPerDay) {
        currentDay++;
        currentSlotInDay = 1;
        currentStartTime = new Date();
        currentStartTime.setHours(startHour, 0, 0, 0); // Réinitialiser à 8h du matin
      }
    }
  }

  // Affichage amélioré du planning
  console.log('\n===== PLANNING OPTIMISÉ DES EXAMENS =====');
  console.log(`Durée totale: ${bestSolution.fitness} heures\n`);

  timeSlots.forEach((ts, index) => {
    const day = Math.floor(index / examsPerDay) + 1;
    const slotInDay = (index % examsPerDay) + 1;

    console.log(`JOUR ${day} - CRÉNEAU ${slotInDay}`);
    console.log(`⏰ Horaire: ${ts.startTime} - ${ts.endTime} (${ts.duration}h)`);
    console.log('📚 Matières:');

    ts.subjects.forEach(subject => {
      const studentsList = affectedStudents.get(subject) || [];
      console.log(`   - ${subject} (${studentsList.length} étudiants)`);
    });

    console.log('----------------------------------------\n');
  });

  return {
    totalTime: bestSolution.fitness,
    schedule: bestSolution.schedule,
    timeSlots,
    affectedStudents
  };
}