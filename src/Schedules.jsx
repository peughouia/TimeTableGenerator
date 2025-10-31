import React, { useState, useCallback, useMemo } from "react";
import { DateTime, Settings } from "luxon";
import ical from "ical-generator";

// Configure Luxon pour le français
Settings.defaultLocale = "fr";

// --- Constantes et Mappings ---
const DAYS_OF_WEEK = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];
const TIMEZONES = [
  "Europe/Paris",
  "America/New_York",
  "Asia/Tokyo",
  "Europe/London",
];
const RECURRENCE_OPTIONS = { WEEKLY: "Hebdomadaire", DAILY: "Quotidienne" };
const ALARM_OPTIONS = [
  { value: 0, label: "Pas de notification" },
  { value: 10, label: "10 minutes avant" },
  { value: 15, label: "15 minutes avant" },
  { value: 30, label: "30 minutes avant" },
  { value: 60, label: "1 heure avant" },
];

// --- Constantes de la Grille ---
const START_HOUR = 0;
const END_HOUR = 23;
const GRID_HEIGHT = 1000;
const HOUR_HEIGHT = GRID_HEIGHT / (END_HOUR - START_HOUR);

// --- Logique de Positionnement (Réutilisée) ---

const calculateEventPosition = (startTime, endTime) => {
  const timeToMinutes = (time) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  const gridStartMinutes = START_HOUR * 60;
  const minutesSinceGridStart = Math.max(0, startMinutes - gridStartMinutes);
  const durationMinutes = endMinutes - startMinutes;
  const top = (minutesSinceGridStart / 60) * HOUR_HEIGHT;
  const height = (durationMinutes / 60) * HOUR_HEIGHT;
  return { top: Math.max(0, top), height: Math.max(10, height) };
};

const pixelsToTime = (y) => {
  const totalMinutes = (y / HOUR_HEIGHT) * 60;
  const totalMinutesSinceMidnight = totalMinutes + START_HOUR * 60;
  const roundedMinutes = Math.round(totalMinutesSinceMidnight / 30) * 30;
  const hour = Math.floor(roundedMinutes / 60);
  const minute = roundedMinutes % 60;
  return `${hour.toString().padStart(2, "0")}:${minute
    .toString()
    .padStart(2, "0")}`;
};

// --- Composants de la Grille ---

const EventDisplay = React.memo(({ event, eventIndex, onEdit }) => {
  const { top, height } = calculateEventPosition(event.start, event.end);

  const handleEventClick = (e) => {
    e.stopPropagation();
    onEdit(event);
  };

  return (
    <div
      className="absolute w-[95%] left-[2.5%] p-1 sm:p-2 rounded-md border border-white shadow-lg cursor-pointer text-white overflow-hidden transition-all hover:z-50 hover:scale-105"
      style={{
        top: `${top}px`,
        height: `${height}px`,
        backgroundColor: event.color,
        zIndex: 10 + eventIndex,
      }}
      onClick={handleEventClick}
    >
      <div className="text-[10px] sm:text-xs">
        <strong className="block whitespace-nowrap overflow-hidden text-ellipsis">
          {event.start} - {event.end}
        </strong>
        <p className="m-0 whitespace-nowrap overflow-hidden text-ellipsis hidden sm:block">
          {event.title}
        </p>
        <p className="m-0 whitespace-nowrap overflow-hidden text-ellipsis sm:hidden">
          {event.title.length > 10
            ? event.title.substring(0, 10) + "..."
            : event.title}
        </p>
      </div>
    </div>
  );
});

const EventModal = ({
  editingEvent,
  setEditingEvent,
  handleSaveEdit,
  handleDeleteEvent,
  handleCloseModal,
  DAYS_OF_WEEK,
}) => {
  const isNew = useMemo(
    () => editingEvent && !editingEvent.start,
    [editingEvent]
  );

  if (!editingEvent) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-1000 flex justify-center items-center p-4">
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg sm:text-xl font-bold mb-4">
          {isNew ? "Créer" : "Modifier"} l'Événement
        </h3>

        <label className="block mt-2 text-sm font-medium">Titre</label>
        <input
          type="text"
          value={editingEvent.title}
          onChange={(e) =>
            setEditingEvent({ ...editingEvent, title: e.target.value })
          }
          className="p-2 border border-gray-300 rounded-md w-full mb-3"
        />

        <label className="block mt-2 text-sm font-medium">Jour</label>
        <select
          value={editingEvent.day}
          onChange={(e) =>
            setEditingEvent({ ...editingEvent, day: parseInt(e.target.value) })
          }
          className="p-2 border border-gray-300 rounded-md w-full mb-3"
        >
          {DAYS_OF_WEEK.map((dayName, index) => (
            <option key={index} value={index}>
              {dayName}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-5">
          <div>
            <label className="block text-sm font-medium mb-1">Début</label>
            <input
              type="time"
              value={editingEvent.start}
              onChange={(e) =>
                setEditingEvent({ ...editingEvent, start: e.target.value })
              }
              className="p-2 border border-gray-300 rounded-md w-2/3 sm:w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fin</label>
            <input
              type="time"
              value={editingEvent.end}
              onChange={(e) =>
                setEditingEvent({ ...editingEvent, end: e.target.value })
              }
              className="p-2 border border-gray-300 rounded-md  w-2/3 sm:w-full"
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium mb-1">Couleur</label>
            <input
              type="color"
              value={editingEvent.color}
              onChange={(e) =>
                setEditingEvent({ ...editingEvent, color: e.target.value })
              }
              className="h-9 w-full border-0 p-0 cursor-pointer rounded"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <button
            onClick={handleSaveEdit}
            className="w-full sm:flex-1 bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition"
          >
            Enregistrer
          </button>

          {!isNew && (
            <button
              onClick={() => handleDeleteEvent(editingEvent.id)}
              className="w-full sm:w-auto bg-red-500 text-white font-bold py-2 px-4 rounded-md hover:bg-red-600 transition"
            >
              Supprimer
            </button>
          )}

          <button
            onClick={handleCloseModal}
            className="w-full sm:w-auto bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-gray-300 transition"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

const HelpModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-1000 flex justify-center items-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Guide d'Utilisation  📅</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6 text-gray-600">
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-600 mb-4">
              Bienvenue sur le générateur d'emplois du temps ! Cette application
              vous permet de concevoir visuellement un planning hebdomadaire et
              de l'exporter dans un format de calendrier universel (.ics).
            </p>

            <section className="mb-6">
              <h4 className="text-lg font-bold text-gray-800 mb-3">
                1. Configuration Initiale 📝
              </h4>
              <p className="mb-2">
                Avant de commencer, vérifiez les options en haut de page :
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Nom du Fichier :</strong> Sert uniquement à nommer le
                  fichier de calendrier qui sera téléchargé.
                </li>
                <li>
                  <strong>Fuseau Horaire :</strong>{" "}
                  <span className="text-red-600 font-semibold">Crucial !</span>{" "}
                  Assurez-vous de sélectionner votre fuseau horaire actuel. Cela
                  garantit que les heures des événements seront correctes une
                  fois importées dans votre calendrier personnel.
                </li>
                <li>
                  <strong>Date de Début :</strong> C'est la date (généralement
                  un lundi) à partir de laquelle la récurrence de vos événements
                  commencera.
                </li>
                <li>
                  <strong>Alarme :</strong> Définissez un rappel pour tous les
                  événements de votre planning.
                </li>
              </ul>
            </section>

            <section className="mb-6">
              <h4 className="text-lg font-bold text-gray-800 mb-3">
                2. Interagir avec la Grille Horaire ⚙️
              </h4>
              <p className="mb-2">
                La grille représente votre semaine de travail 
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Ajouter un Événement :</strong> Cliquez simplement sur
                  la case horaire et le jour souhaités. Un formulaire s'ouvrira
                  pour vous permettre de saisir le titre, ajuster les heures de
                  début/fin, et choisir une couleur.
                </li>
                <li>
                  <strong>Modifier/Supprimer :</strong> Cliquez sur n'importe
                  quel événement existant dans la grille pour rouvrir le
                  formulaire et effectuer des modifications ou utiliser le
                  bouton de suppression.
                </li>
                <li>
                  <strong>Navigation Mobile :</strong> Sur mobile, la grille est
                  large pour garantir la lisibilité des événements.{" "}
                  <strong>Faites défiler horizontalement</strong> pour
                  visualiser les jours du milieu et de la fin de semaine.
                </li>
              </ul>
            </section>

            <section>
              <h4 className="text-lg font-bold text-gray-800 mb-3">
                3. Exporter et Importer 💾
              </h4>
              <p className="mb-2">
                Le calendrier est automatiquement sauvegardé dans l'application,
                mais vous devez l'exporter pour l'utiliser :
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Exportation :</strong> Cliquez sur le bouton{" "}
                  <span className="font-semibold">
                    "Générer le fichier ICS"
                  </span>
                  . Cela créera et téléchargera un fichier .ics.
                </li>
                <li>
                  <strong>Récurrence :</strong> Le fichier .ics exporté contient
                  une <strong>récurrence hebdomadaire</strong> pour tous les
                  événements que vous avez définis.
                </li>
                <li>
                  <strong>Importation :</strong> Ouvrez votre application de
                  calendrier préférée (Google, Outlook, Apple, etc.) et utilisez
                  l'option "Importer un calendrier" ou "Ajouter à partir d'un
                  fichier" pour sélectionner le fichier .ics téléchargé.
                </li>
                          </ul>
                          <p className="mt-4">
                          <strong>Conseils :Synchronisez votre Calendrier a votre compte gmail.</strong>  
                          </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

// ...existing code...

const TimeGrid = React.memo(({ events, setEvents, DAYS_OF_WEEK }) => {
  const [editingEvent, setEditingEvent] = useState(null);

  // --- Fonctions de Gestion ---

  const handleEditClick = useCallback((event) => {
    setEditingEvent({ ...event });
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!editingEvent) return;

    const eventExists = events.some((e) => e.id === editingEvent.id);

    if (!eventExists) {
      // Création : Trouver un nouvel ID si ce n'est pas déjà fait
      const newId =
        events.length > 0 ? Math.max(...events.map((e) => e.id)) + 1 : 1;
      setEvents((prev) => [
        ...prev,
        { ...editingEvent, id: editingEvent.id || newId },
      ]);
    } else {
      // Mise à jour
      setEvents((prevEvents) =>
        prevEvents.map((e) => (e.id === editingEvent.id ? editingEvent : e))
      );
    }
    setEditingEvent(null);
  }, [editingEvent, events, setEvents]);

  const handleCloseModal = useCallback(() => {
    setEditingEvent(null);
  }, []);

  const handleDeleteEvent = useCallback(
    (id) => {
      setEvents((prevEvents) => prevEvents.filter((e) => e.id !== id));
      setEditingEvent(null);
    },
    [setEvents]
  );

  const handleGridClick = useCallback((e, dayIndex) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const yClickPosition = e.clientY - rect.top;

    const newStartTime = pixelsToTime(yClickPosition);

    const startDateTime = DateTime.fromFormat(newStartTime, "HH:mm");
    const newEndTime = startDateTime.plus({ hours: 1 }).toFormat("HH:mm");

    const newEvent = {
      // Laissez l'ID à null ici, il sera généré à l'enregistrement
      id: null,
      day: dayIndex,
      title: "Nouvel événement",
      start: newStartTime,
      end: newEndTime,
      color: "#607D8B",
    };

    setEditingEvent(newEvent);
  }, []);

  // --- Rendu des Éléments de la Grille ---

  // CORRECTION 1 : Rendu des labels d'heure dans la colonne latérale
  const timeLabels = useMemo(() => {
    const labels = [];
    for (let h = START_HOUR; h <= END_HOUR; h++) {
      labels.push(
        <div
          key={h}
          style={{ height: HOUR_HEIGHT }}
          className="border-b border-dashed border-gray-200 relative"
        >
          <span className="absolute right-0 -top-2.5 text-xs text-gray-500 pr-1">
            {h.toString().padStart(2, "0")}:00
          </span>
        </div>
      );
    }
    return labels;
  }, []);

  // CORRECTION 2 : Rendu des lignes d'heure pour le corps de la grille
  const timeLines = useMemo(() => {
    const lines = [];
    for (let h = START_HOUR; h < END_HOUR; h++) {
      lines.push(
        <div
          key={h}
          className="absolute left-0 right-0 border-b border-gray-200 border-dashed"
          style={{ top: `${(h - START_HOUR) * HOUR_HEIGHT}px` }}
        ></div>
      );
    }
    return lines;
  }, []);

  return (
    <div className="flex border border-gray-300 rounded-lg overflow-hidden my-4 max-w-full">
      {/* CORRECTION 1.A : Colonne des heures (Largeur et Alignement) */}
      <div className="w-12 pr-1 pt-10 relative shrink-0 text-right">
        {timeLabels}
      </div>

      {/* Corps de la grille (Jours) */}
      <div className="flex flex-col grow">
        {/* Ligne des jours de la semaine */}
        <div className="flex border-b border-gray-300">
          {DAYS_OF_WEEK.map((dayName, index) => (
            <div
              key={index}
              className="flex-1 text-center py-2 font-semibold bg-gray-50 text-sm border-l border-gray-200 first:border-l-0"
            >
              <span className="hidden sm:inline">{dayName}</span>
              <span className="inline sm:hidden">
                {dayName.substring(0, 2)}
              </span>
            </div>
          ))}
        </div>

        {/* Conteneur des événements */}
        <div
          className="flex relative w-full"
          style={{ height: `${GRID_HEIGHT}px` }}
        >
          {DAYS_OF_WEEK.map((_, dayIndex) => (
            <div
              key={dayIndex}
              className="flex-1 border-l border-gray-200 relative h-full"
              onClick={(e) => handleGridClick(e, dayIndex)}
            >
              {/* CORRECTION 2.B : Lignes d'heure superposées */}
              <div className="absolute inset-0 z-0 pointer-events-none">
                {timeLines}
              </div>

              {/* Affichage des événements pour ce jour */}
              {events
                .filter((e) => e.day === dayIndex)
                .map((event, eventIndex) => (
                  <EventDisplay
                    key={event.id}
                    event={event}
                    eventIndex={eventIndex}
                    onEdit={handleEditClick}
                  />
                ))}
            </div>
          ))}
        </div>
      </div>

      {/* Modal d'édition/création */}
      <EventModal
        editingEvent={editingEvent}
        setEditingEvent={setEditingEvent}
        handleSaveEdit={handleSaveEdit}
        handleDeleteEvent={handleDeleteEvent}
        handleCloseModal={handleCloseModal}
        DAYS_OF_WEEK={DAYS_OF_WEEK}
      />
    </div>
  );
});

// --- Composant Principal (TimeTableGenerator) (Reste inchangé) ---
export function TimeTableGenerator() {
  // Ajouter cet état avec les autres états existants
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // ... autres états existants ...

  const [events, setEvents] = useState([
    {
      id: 1,
      day: 0,
      title: "Lecture – Dev",
      start: "08:00",
      end: "09:30",
      color: "#3B82F6",
    },
    {
      id: 2,
      day: 2,
      title: "Projet Principal",
      start: "10:00",
      end: "14:00",
      color: "#10B981",
    },
    {
      id: 3,
      day: 4,
      title: "Sport/Relaxation",
      start: "17:00",
      end: "18:30",
      color: "#F59E0B",
    },
  ]);
  const [fileName, setFileName] = useState("mon_emploi_du_temps");
  const [selectedTz, setSelectedTz] = useState("Europe/Paris");

  const nextMonday = DateTime.now().setLocale("fr").startOf("week");
  const [startDate, setStartDate] = useState(nextMonday.toISODate());

  const [recurrence, setRecurrence] = useState("WEEKLY");
  const [alarmMinutes, setAlarmMinutes] = useState(30);
  const [recurrenceLimit, setRecurrenceLimit] = useState("infinite");
  const [recurrenceCount, setRecurrenceCount] = useState(10);

  const generateICS = () => {
    const repeatingOptions = { freq: recurrence };
    if (recurrenceLimit === "count" && recurrenceCount > 0) {
      repeatingOptions.count = recurrenceCount;
    } else {
      const farFutureDate = DateTime.now().plus({ years: 50 }).toJSDate();
      repeatingOptions.until = farFutureDate;
    }

    const cal = ical({
      domain: "perso-timetable.fr",
      name: fileName.replace(/ /g, "_"),
      timezone: selectedTz,
      prodId: `//Emploi du Temps Personnel//${selectedTz}//`,
    });

    events.forEach((event) => {
      try {
        const startOfDay = DateTime.fromISO(startDate, { zone: selectedTz })
          .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
          .plus({ days: event.day });

        let startTime = DateTime.fromFormat(event.start, "HH:mm", {
          zone: selectedTz,
        });
        let endTime = DateTime.fromFormat(event.end, "HH:mm", {
          zone: selectedTz,
        });

        if (!startTime.isValid || !endTime.isValid) return;

        let dtStart = startOfDay.set({
          hour: startTime.hour,
          minute: startTime.minute,
        });
        let dtEnd = startOfDay.set({
          hour: endTime.hour,
          minute: endTime.minute,
        });

        if (dtEnd <= dtStart) {
          dtEnd = dtEnd.plus({ days: 1 });
        }

        const newEvent = cal.createEvent({
          start: dtStart.toJSDate(),
          end: dtEnd.toJSDate(),
          summary: event.title,
          description: `Activité récurrente : ${event.title}`,
          uid: `${event.id}-${event.day}-${event.title}`,
          repeating: repeatingOptions,
          color: event.color,
        });

        if (alarmMinutes > 0) {
          newEvent.createAlarm({
            type: "display",
            trigger: alarmMinutes,
            triggerBefore: true,
            description: `Rappel pour ${event.title}`,
          });
        }
      } catch (error) {
        console.error(
          `Erreur lors du traitement de l'événement ${event.title}:`,
          error
        );
      }
    });

    const icsContent = cal.toString();
    const blob = new Blob([icsContent], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName.replace(/ /g, "_")}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto bg-white shadow-2xl rounded-xl p-6 md:p-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="sm:text-3xl text-sm  font-extrabold text-gray-900 flex items-center">
            📅 Générateur d'Emploi du Temps ICS
          </h1>
          <button
            onClick={() => setIsHelpOpen(true)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
            title="Aide"
          >
            ❔
          </button>
        </div>

        {/* Ajouter le modal d'aide */}
        <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

        <hr className="mb-8 border-gray-200" />

        {/* SECTION 1: Options Globales */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-700 mb-4">
            Options Globales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                Nom du Fichier (.ics)
              </label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                Fuseau Horaire
              </label>
              <select
                value={selectedTz}
                onChange={(e) => setSelectedTz(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                Date de Début (Semaine)
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                Notification (Alarme)
              </label>
              <select
                value={alarmMinutes}
                onChange={(e) => setAlarmMinutes(parseInt(e.target.value))}
                className="p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                {ALARM_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 flex flex-col md:flex-row gap-4 items-start md:items-end">
            <div className="flex flex-col w-full md:w-auto">
              <label className="text-sm font-medium text-gray-600 mb-1">
                Fréquence
              </label>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                {Object.entries(RECURRENCE_OPTIONS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col w-full md:w-auto">
              <label className="text-sm font-medium text-gray-600 mb-1">
                Fin de la Récurrence
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={recurrenceLimit}
                  onChange={(e) => setRecurrenceLimit(e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="infinite">Infinie</option>
                  <option value="count">Après N semaines</option>
                </select>
                {recurrenceLimit === "count" && (
                  <>
                    <input
                      type="number"
                      min="1"
                      value={recurrenceCount}
                      onChange={(e) =>
                        setRecurrenceCount(
                          Math.max(1, parseInt(e.target.value))
                        )
                      }
                      className="p-2 border border-gray-300 rounded-lg w-20 text-center"
                    />
                    <span className="text-sm text-gray-600">semaines</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        <hr className="mb-8 border-gray-200" />

        {/* SECTION 2: Grille Visuelle (TimeGrid) */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-700 mb-4">
            🗓️ Configuration Visuelle de l'Emploi du Temps
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Cliquez sur une heure vide pour créer un événement, ou cliquez sur
            un événement existant pour le modifier/supprimer.
          </p>

          <div className="overflow-x-auto">
            <TimeGrid
              events={events}
              setEvents={setEvents}
              DAYS_OF_WEEK={DAYS_OF_WEEK}
            />
          </div>
        </section>

        <hr className="mb-8 border-gray-200" />

        {/* SECTION 3: Action */}
        <section>
          <button
            onClick={generateICS}
            className="w-full bg-indigo-600 text-white font-extrabold py-3 rounded-lg text-lg shadow-lg hover:bg-indigo-700 transition duration-150 ease-in-out"
          >
            💾 Générer et Télécharger le Fichier .ics
          </button>
        </section>
      </div>
    </div>
  );
}
