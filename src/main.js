import { formatDistance } from 'date-fns';
import './style.css';
import { VideoPlayer } from './components/VideoPlayer.js';
import { Timeline } from './components/Timeline.js';
import { AnnotationStore } from './store/AnnotationStore.js';
import { AnnotationList } from './components/AnnotationList.js';
import { AddAnnotationModal } from './components/AddAnnotationModal.js';
import { EditAnnotationModal } from './components/EditAnnotationModal.js';

// Make store globally available for event handlers
window.annotationStore = new AnnotationStore();

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize components
  const player = new VideoPlayer(document.getElementById('video-player'), window.annotationStore);
  const timeline = new Timeline(document.getElementById('timeline'), window.annotationStore);
  const annotationList = new AnnotationList(document.getElementById('annotations-container'), window.annotationStore);

  // Initialize modals
  window.addAnnotationModal = new AddAnnotationModal('add-modal', window.annotationStore);
  window.editAnnotationModal = new EditAnnotationModal('edit-modal', window.annotationStore);

  // Add event listeners
  document.getElementById('add-annotation').addEventListener('click', () => {
    window.addAnnotationModal.open();
  });
});