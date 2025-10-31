import React, { useState, useCallback, useMemo } from "react";
import { DateTime } from "luxon";

// --- Constantes de la Grille (Doivent être cohérentes avec le parent) ---
const START_HOUR = 6;
const END_HOUR = 22;
const GRID_HEIGHT = 1000;
const HOUR_HEIGHT = GRID_HEIGHT / (END_HOUR - START_HOUR);

// Le parent doit transmettre cette constante
const DAYS_OF_WEEK = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];

// --- Logique de Positionnement ---

const calculateEventPosition = (startTime, endTime) => {
  // ... (Logique inchangée) ...
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
  // ... (Logique inchangée) ...
  const totalMinutes = (y / HOUR_HEIGHT) * 60;
  const totalMinutesSinceMidnight = totalMinutes + START_HOUR * 60;
  const roundedMinutes = Math.round(totalMinutesSinceMidnight / 30) * 30;
  const hour = Math.floor(roundedMinutes / 60);
  const minute = roundedMinutes % 60;
  return `${hour.toString().padStart(2, "0")}:${minute
    .toString()
    .padStart(2, "0")}`;
};

// --- Composant EventDisplay ---

const EventDisplay = React.memo(({ event, eventIndex, onEdit }) => {
  const { top, height } = calculateEventPosition(event.start, event.end);

  const handleEventClick = (e) => {
    e.stopPropagation();
    onEdit(event);
  };

  return (
    // TAILLE MAXIMALE ET TAILLE DE POLICE MINIMALE SUR MOBILE (text-xs, p-1)
    <div
      className="absolute w-[95%] p-1 rounded-md border-2 border-white shadow-lg cursor-pointer text-white text-[10px] sm:text-xs overflow-hidden"
      style={{
        top: `${top}px`,
        height: `${height}px`,
        backgroundColor: event.color,
        zIndex: 10 + eventIndex,
      }}
      onClick={handleEventClick}
    >
      <strong className="block">
        {event.start} - {event.end}
      </strong>
      <p className="m-0 whitespace-nowrap overflow-hidden text-ellipsis">
        {event.title}
      </p>
    </div>
  );
});

// --- Composant EventModal (inchangé) ---

const EventModal = ({
  editingEvent,
  setEditingEvent,
  handleSaveEdit,
  handleDeleteEvent,
  handleCloseModal,
}) => {
  // ... (Logique du Modal inchangée) ...
  const isNew = useMemo(
    () => editingEvent && !editingEvent.start,
    [editingEvent]
  );

  if (!editingEvent) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-1000 flex justify-center items-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-sm">
        <h3 className="text-xl font-bold mb-4 text-gray-800">
          {isNew ? "Créer" : "Modifier"} l'Événement
        </h3>

        <label className="block mt-2 text-sm font-medium text-gray-600">
          Titre
        </label>
        <input
          type="text"
          value={editingEvent.title}
          onChange={(e) =>
            setEditingEvent({ ...editingEvent, title: e.target.value })
          }
          className="p-2 border border-gray-300 rounded-md w-full mb-3 focus:ring-blue-500 focus:border-blue-500"
        />

        <label className="block mt-2 text-sm font-medium text-gray-600">
          Jour
        </label>
        <select
          value={editingEvent.day}
          onChange={(e) =>
            setEditingEvent({ ...editingEvent, day: parseInt(e.target.value) })
          }
          className="p-2 border border-gray-300 rounded-md w-full mb-3 focus:ring-blue-500 focus:border-blue-500"
        >
          {DAYS_OF_WEEK.map((dayName, index) => (
            <option key={index} value={index}>
              {dayName}
            </option>
          ))}
        </select>

        <div className="flex gap-4 mb-5 flex-wrap">
          <div className="flex-1 min-w-[100px]">
            <label className="block text-sm font-medium text-gray-600">
              Début
            </label>
            <input
              type="time"
              value={editingEvent.start}
              onChange={(e) =>
                setEditingEvent({ ...editingEvent, start: e.target.value })
              }
              className="p-2 border mr-2 border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex-1 min-w-[100px]">
            <label className="block text-sm font-medium text-gray-600">
              Fin
            </label>
            <input
              type="time"
              value={editingEvent.end}
              onChange={(e) =>
                setEditingEvent({ ...editingEvent, end: e.target.value })
              }
              className="p-2 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="w-14">
            <label className="block text-sm font-medium text-gray-600">
              Couleur
            </label>
            <input
              type="color"
              value={editingEvent.color}
              onChange={(e) =>
                setEditingEvent({ ...editingEvent, color: e.target.value })
              }
              className="h-9 w-full border-0 p-0 cursor-pointer block mt-1"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          {!isNew && (
            <button
              onClick={() => handleDeleteEvent(editingEvent.id)}
              className="bg-red-500 text-white font-bold py-2 px-3 rounded-md hover:bg-red-600 transition text-sm"
            >
              Supprimer
            </button>
          )}

          <button
            onClick={handleCloseModal}
            className="bg-gray-200 text-gray-800 font-bold py-2 px-3 rounded-md hover:bg-gray-300 transition text-sm"
          >
            Annuler
          </button>
          <button
            onClick={handleSaveEdit}
            className="bg-blue-600 text-white font-bold py-2 px-3 rounded-md hover:bg-blue-700 transition text-sm"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Composant Principal TimeGrid ---

export function TimeGrid({ events, setEvents }) {
  const [editingEvent, setEditingEvent] = useState(null);

  // ... (handleEditClick, handleSaveEdit, handleDeleteEvent, handleGridClick inchangées)

  // --- Rendu des Éléments de la Grille ---

  // Rendu des labels d'heure dans la colonne latérale (Optimisé Mobile)
  const timeLabels = useMemo(() => {
    const labels = [];
    for (let h = START_HOUR; h <= END_HOUR; h++) {
      labels.push(
        <div
          key={h}
          style={{ height: HOUR_HEIGHT }}
          className="border-b border-dashed border-gray-200 relative"
        >
          {/* Réduit la taille de police au strict minimum (text-xs) */}
          <span className="absolute right-0 -top-2.5 text-[10px] sm:text-xs text-gray-500 pr-1">
            {h.toString().padStart(2, "0")}:00
          </span>
        </div>
      );
    }
    return labels;
  }, []);

  // Rendu des lignes d'heure pour le corps de la grille (inchangé)
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
    <div className="flex border border-gray-300 rounded-lg overflow-hidden my-4">
      {/* Conteneur principal de la grille : FORCÉ à une largeur minimale de 600px pour que le contenu ne s'écrase pas, activant le SCROLL HORIZONTAL sur mobile. */}
      <div className="flex relative w-full overflow-x-auto min-w-[600px] md:min-w-0">
        {/* Colonne des heures : Réduite à 40px sur mobile, padding minimal */}
        <div className="w-10 sm:w-16 pr-1 pt-10 relative shrink-0 text-right">
          {timeLabels}
        </div>

        {/* Corps de la grille (Jours) */}
        <div className="flex flex-col grow">
          {/* Ligne des jours de la semaine : Tailles de police minimales et affichage abrégé */}
          <div className="flex border-b border-gray-300">
            {DAYS_OF_WEEK.map((dayName, index) => (
              <div
                key={index}
                className="flex-1 text-center py-2 font-semibold bg-gray-50 text-[10px] sm:text-xs border-l border-gray-200 first:border-l-0"
              >
                <span className="hidden sm:inline">{dayName}</span>
                {/* Affiche seulement 1 lettre du jour sur mobile (L, M, M, J, V, S, D) */}
                <span className="inline sm:hidden">
                  {dayName.substring(0, 1)}
                </span>
              </div>
            ))}
          </div>

          {/* Conteneur des événements (La grille d'heures elle-même) */}
          <div
            className="flex relative w-full"
            style={{ height: `${GRID_HEIGHT}px` }}
          >
            {DAYS_OF_WEEK.map((_, dayIndex) => (
              // Chaque colonne de jour prend une fraction de la largeur restante, forçant l'étirement du min-w
              <div
                key={dayIndex}
                className="flex-1 border-l border-gray-200 relative h-full"
                onClick={(e) => handleGridClick(e, dayIndex)}
              >
                {/* Lignes d'heure superposées */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                  {timeLines}
                </div>

                {/* Affichage des événements */}
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
      </div>

      {/* Modal d'édition/création */}
      <EventModal
        editingEvent={editingEvent}
        setEditingEvent={setEditingEvent}
        handleSaveEdit={handleSaveEdit}
        handleDeleteEvent={handleDeleteEvent}
        handleCloseModal={handleCloseModal}
      />
    </div>
  );
}

// Exportez également DAYS_OF_WEEK pour être sûr que le parent puisse le réutiliser
export { DAYS_OF_WEEK };
