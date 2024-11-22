# Video Annotation System

## Architecture Globale

Le système permet d'annoter des vidéos avec des marqueurs temporels, des pins positionnels et des réponses aux annotations. Il est construit avec une architecture modulaire utilisant JavaScript vanilla et Tailwind CSS.

![alt tag]([url de ton image](https://github.com/user-attachments/assets/6d3a0f2c-9f30-449e-9cc2-edfbf1fd0620))

## Composants Principaux

### 1. VideoPlayer (`src/components/VideoPlayer.js`)

Gère la lecture vidéo et l'affichage des contrôles.

**Inputs:**
- `element`: Element DOM de la vidéo
- `store`: Instance du AnnotationStore

**Outputs:**
- Contrôles de lecture vidéo (play/pause, skip)
- Affichage des pins sur la vidéo
- Events de mise à jour du temps
- Auto-masquage des contrôles après 2 secondes

### 2. Timeline (`src/components/Timeline.js`)

Affiche la timeline avec les marqueurs d'annotation.

**Inputs:**
- `element`: Element DOM de la timeline
- `store`: Instance du AnnotationStore

**Outputs:**
- Barre de progression
- Marqueurs d'annotation cliquables
- Navigation temporelle

### 3. AnnotationList (`src/components/AnnotationList.js`)

Affiche la liste des annotations et leurs réponses.

**Inputs:**
- `element`: Element DOM du conteneur
- `store`: Instance du AnnotationStore

**Outputs:**
- Liste des annotations avec:
  - Texte
  - Timestamp
  - Indicateur de pin
  - Boutons d'édition/suppression
  - Système de réponses
  - Confirmation de suppression des réponses

### 4. Store (`src/store/AnnotationStore.js`)

Gère l'état global de l'application.

**Méthodes:**
```javascript
addAnnotation({ videoId, text, timestamp, pinPosition })
updateAnnotation(id, text, timestamp, pinPosition)
deleteAnnotation(id)
addReply(annotationId, text)
updateReply(annotationId, replyId, text)
deleteReply(annotationId, replyId)
setCurrentTime(time)
selectAnnotation(id)
```

**Structure d'une annotation:**
```javascript
{
  id: string,
  videoId: string,
  text: string,
  timestamp: number,
  pinPosition: { x: number, y: number } | null,
  createdAt: Date,
  updatedAt: Date,
  user: {
    id: string,
    name: string
  },
  replies: Array<{
    id: string,
    text: string,
    createdAt: Date,
    updatedAt: Date,
    user: {
      id: string,
      name: string
    }
  }>
}
```

### 5. Modales

#### AddAnnotationModal (`src/components/AddAnnotationModal.js`)

**Inputs:**
- `id`: ID de la modale
- `store`: Instance du AnnotationStore

**Outputs:**
- Formulaire de création avec:
  - Champ texte obligatoire
  - Option d'ajout de pin
  - Preview du pin
  - Validation des données
  - Messages d'erreur

#### EditAnnotationModal (`src/components/EditAnnotationModal.js`)

**Inputs:**
- `id`: ID de la modale
- `store`: Instance du AnnotationStore
- `annotation`: Données de l'annotation à éditer

**Outputs:**
- Formulaire d'édition avec:
  - Champ texte obligatoire
  - Slider de timestamp
  - Option d'ajout/édition de pin
  - Preview du pin
  - Validation des données
  - Messages d'erreur

## Fonctionnalités Clés

### 1. Gestion des Pins

**Processus d'ajout:**
1. Clic sur "Add pin"
2. Interface passe en mode placement
3. Clic sur la vidéo pour placer
4. Coordonnées calculées en pourcentage
5. Option de suppression du pin

### 2. Contrôles Vidéo

**Comportement:**
- Auto-masquage après 2 secondes d'inactivité
- Désactivation pendant le placement de pins
- Navigation temporelle précise
- Désactivation des clics pendant le placement de pins

### 3. Timeline

**Fonctionnalités:**
- Navigation par clic/drag
- Marqueurs visuels des annotations
- Synchronisation avec la vidéo

### 4. Système de Réponses

**Fonctionnalités:**
- Ajout de réponses aux annotations
- Édition/suppression des réponses
- Confirmation de suppression avec overlay modal
- Validation du texte obligatoire

### 5. Validation des Données

**Règles:**
- Texte d'annotation requis
- Texte de réponse requis
- Format timestamp: MM:SS.mmm
- Coordonnées pin: pourcentages (0-100)

## Événements et Communication

### 1. Store Events

Le store émet des événements pour:
- Ajout/modification/suppression d'annotations
- Ajout/modification/suppression de réponses
- Changement de temps courant
- Sélection d'annotation

### 2. Synchronisation

Les composants s'abonnent aux changements via:
```javascript
store.addListener(callback)
```

## Formats de Données

### 1. Timestamp
- Format interne: nombre décimal (secondes)
- Format affichage: MM:SS.mmm

### 2. Position Pin
```javascript
{
  x: number, // pourcentage horizontal (0-100)
  y: number  // pourcentage vertical (0-100)
}
```

## Performance

### Optimisations:
- Debouncing des contrôles vidéo
- Mise à jour sélective des composants
- Gestion efficace des événements DOM
- Masquage conditionnel des formulaires de réponse

## Extensibilité

Le système est conçu pour être étendu avec:
- Support de multiples vidéos
- Persistance des données
- Styles personnalisés
- Nouveaux types d'annotations
- Système d'authentification complet
