// Implémentation de l'algorithme glouton pour l'ordonnancement des examens
import type { Subject, Student } from './types';

export function scheduleExamsGreedy(subjects: Subject[], students: Student[]): Map<string, number> {
  // Construire le graphe de conflit entre les matières
  const conflictGraph: Map<string, Set<string>> = new Map();

  // Initialiser le graphe
  subjects.forEach(subject => {
    conflictGraph.set(subject.name, new Set<string>());
  });

  // Remplir le graphe avec les conflits
  students.forEach(student => {
    for (let i = 0; i < student.subjects.length; i++) {
      for (let j = i + 1; j < student.subjects.length; j++) {
        const subject1 = student.subjects[i];
        const subject2 = student.subjects[j];

        // Ajouter conflit bidirectionnel
        if (conflictGraph.has(subject1)) {
          conflictGraph.get(subject1)!.add(subject2);
        }

        if (conflictGraph.has(subject2)) {
          conflictGraph.get(subject2)!.add(subject1);
        }
      }
    }
  });

  // Trier les matières par nombre de conflits (degré) décroissant
  const sortedSubjects = [...subjects].sort((a, b) => {
    return (conflictGraph.get(b.name)?.size || 0) - (conflictGraph.get(a.name)?.size || 0);
  });

  // Attribuer des créneaux horaires
  const schedule: Map<string, number> = new Map();
  let maxTimeSlot = 0;

  for (const subject of sortedSubjects) {
    const usedSlots = new Set<number>();

    // Trouver les créneaux déjà utilisés par les matières en conflit
    if (conflictGraph.has(subject.name)) {
      const conflicts = conflictGraph.get(subject.name)!;
      conflicts.forEach(conflictSubject => {
        if (schedule.has(conflictSubject)) {
          usedSlots.add(schedule.get(conflictSubject)!);
        }
      });
    }

    // Trouver le premier créneau libre
    let slot = 0;
    while (usedSlots.has(slot)) {
      slot++;
    }

    schedule.set(subject.name, slot);
    maxTimeSlot = Math.max(maxTimeSlot, slot);
  }

  // Calculer le temps total et afficher l'emploi du temps
  let totalTime = 0;
  let startTime = 8; // On commence à 8h00

  // Créer une structure pour compter les étudiants par matière et créneau
  const subjectsPerSlot: Map<number, Map<string, number>> = new Map();

  // Initialiser la structure
  for (let slot = 0; slot <= maxTimeSlot; slot++) {
    subjectsPerSlot.set(slot, new Map<string, number>());
  }

  // Compter combien d'étudiants passent chaque matière
  students.forEach(student => {
    student.subjects.forEach(subjectName => {
      if (schedule.has(subjectName)) {
        const slot = schedule.get(subjectName)!;
        const subjectMap = subjectsPerSlot.get(slot)!;
        subjectMap.set(subjectName, (subjectMap.get(subjectName) || 0) + 1);
      }
    });
  });

  // Afficher l'emploi du temps par jour et créneau
  for (let slot = 0; slot <= maxTimeSlot; slot++) {
    let maxDuration = 0;
    const subjectsInSlot = subjectsPerSlot.get(slot)!;

    // Trouver la durée maximale pour ce créneau
    subjects.forEach(subject => {
      if (schedule.get(subject.name) === slot) {
        maxDuration = Math.max(maxDuration, subject.duration);
      }
    });

    // Calculer l'heure de fin
    const endTime = startTime + maxDuration;

    // Afficher les informations du créneau
    const day = Math.floor(slot / 3) + 1; // 3 créneaux par jour
    const slotNumber = (slot % 3) + 1;

    // Gestion des horaires par jour (8h-18h)
    let displayStartTime = startTime;
    let displayEndTime = endTime;

    // Si on dépasse 18h, on passe au jour suivant à 8h
    if (startTime >= 18) {
      const additionalDays = Math.floor((startTime - 8) / 10);
      displayStartTime = 8 + ((startTime - 8) % 10);
      displayEndTime = displayStartTime + maxDuration;
      if (displayEndTime > 18) {
        displayEndTime = 18;
      }
    }

    console.log(`JOUR ${day} - CRÉNEAU ${slotNumber}`);
    console.log(`⏰ Horaire: ${displayStartTime}:00 - ${displayEndTime}:00 (${maxDuration}h)`);
    console.log(`📚 Matières:`);

    // Afficher les matières et le nombre d'étudiants
    subjectsInSlot.forEach((studentCount, subjectName) => {
      console.log(`   - ${subjectName} (${studentCount} étudiant${studentCount > 1 ? 's' : ''})`);
    });
    console.log("----------------------------------------");

    // Mise à jour du temps total et de l'heure de début pour le prochain créneau
    totalTime += maxDuration;
    startTime = endTime;
  }

  console.log(`Temps total d'examen: ${totalTime} heures`);
  return schedule;
}
