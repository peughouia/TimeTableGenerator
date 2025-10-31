# 📅 Générateur d'Emploi du Temps ICS (iCalendar)

Ce projet est une application React/Tailwind qui permet de créer visuellement un emploi du temps hebdomadaire récurrent et d'exporter le résultat au format **iCalendar (.ics)**, compatible avec la plupart des plateformes de calendrier (Google Calendar, Outlook, Apple Calendar, Thunderbird, etc.).

-----

## ✨ Fonctionnalités Principales

  * **Création Visuelle :** Interface utilisateur interactive (grille horaire) pour définir les événements sur la semaine.
  * **Mobile-Friendly :** La grille est optimisée pour les appareils mobiles, permettant un **défilement horizontal** pour visualiser tous les jours de la semaine sans compression.
  * **Gestion des Événements :** Ajoutez, modifiez et supprimez des événements en cliquant directement sur la grille ou sur un événement existant.
  * **Export ICS :** Générez un fichier `.ics` qui contient tous vos événements avec des options de récurrence (hebdomadaire), de fuseau horaire et d'alarme.
  * **Personnalisation :** Définition du titre, des heures de début/fin, du jour et de la couleur de chaque événement.

-----

## 🛠️ Technologies Utilisées

  * **Frontend :** React
  * **Styling :** Tailwind CSS (pour une approche mobile-first et un design rapide)
  * **Gestion du Temps :** `luxon` (pour la manipulation des dates et fuseaux horaires)
  * **Génération ICS :** `ical-generator`

-----

## 🚀 Comment Démarrer le Projet

Suivez ces étapes pour cloner le dépôt et lancer l'application sur votre machine locale.

### 1\. Prérequis

Assurez-vous d'avoir [Node.js](https://nodejs.org/) et [npm (Node Package Manager)](https://www.npmjs.com/get-npm) installés.

### 2\. Cloner le Dépôt

Ouvrez votre terminal et exécutez la commande suivante :

```bash
git clone [URL_DE_VOTRE_DEPOT]
cd [NOM_DU_REPERTOIRE]
```

### 3\. Installation des Dépendances

Installez toutes les dépendances nécessaires au projet :

```bash
npm install
```

### 4\. Lancer l'Application

Démarrez le serveur de développement. L'application sera accessible dans votre navigateur à l'adresse [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) (ou similaire, selon votre configuration).

```bash
npm run dev # ou npm start si vous utilisez Create React App
```

-----

## 💡 Comment Utiliser l'Application

L'utilisation est simple et intuitive :

1.  **Configurer les Options Globales :**

      * Saisissez le **Nom du fichier ICS** (ex: *Mon\_Planning\_Personnel*).
      * Choisissez votre **Fuseau Horaire** (essentiel pour un export ICS correct).
      * Définissez la **Date de Début** de la première semaine de récurrence (généralement le prochain lundi).
      * Configurez une **Alarme** (optionnel) pour recevoir une notification avant chaque événement.

2.  **Créer un Événement :**

      * **Cliquez** sur la case horaire et le jour souhaités dans la grille. Un modal (fenêtre pop-up) s'ouvrira.
      * Remplissez le **Titre**, ajustez les **Heures de Début/Fin** et choisissez une **Couleur**.
      * Cliquez sur **Enregistrer**. L'événement apparaît immédiatement dans la grille.

3.  **Modifier/Supprimer un Événement :**

      * **Cliquez** sur un événement déjà affiché dans la grille pour rouvrir le modal.
      * Modifiez les détails ou utilisez le bouton **Supprimer**.

4.  **Exporter l'Emploi du Temps :**

      * Une fois tous vos événements ajoutés, cliquez sur le bouton vert **"Générer le fichier ICS"** en bas de page.
      * Un fichier `.ics` sera téléchargé. Vous pouvez l'importer dans l'application de calendrier de votre choix.

