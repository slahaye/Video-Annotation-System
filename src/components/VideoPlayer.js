export class VideoPlayer {
  constructor(element, store) {
    this.video = element;
    this.store = store;
    this.isPlaying = false;
    this.videoContainer = this.video.parentElement;
    this.controlsTimeout = null;
    
    this.initializeControls();
    this.initializePinOverlay();
    this.addEventListeners();

    // Ajouter un listener pour mettre à jour les pins quand le store change
    this.store.addListener(() => this.updatePins());
  }

  initializeControls() {
    this.playPauseBtn = document.getElementById('play-pause');
    this.skipBackBtn = document.getElementById('skip-back');
    this.skipForwardBtn = document.getElementById('skip-forward');
    this.controlsContainer = this.videoContainer.querySelector('.bg-gradient-to-t');

    // Initial state: hide controls
    this.hideControls();
  }

  initializePinOverlay() {
    this.pinOverlay = document.createElement('div');
    this.pinOverlay.className = 'absolute inset-0 pointer-events-none';
    this.videoContainer.appendChild(this.pinOverlay);
  }

  addEventListeners() {
    this.video.addEventListener('timeupdate', () => {
      if (this.isPlaying) {
        this.store.selectAnnotation(null);
      }
      this.store.setCurrentTime(this.video.currentTime);
      this.updatePins();
    });

    this.playPauseBtn.addEventListener('click', () => this.togglePlay());
    this.skipBackBtn.addEventListener('click', () => {
      this.skip(-10);
      this.store.selectAnnotation(null);
    });
    this.skipForwardBtn.addEventListener('click', () => {
      this.skip(10);
      this.store.selectAnnotation(null);
    });

    // Ajouter des écouteurs pour play/pause
    this.video.addEventListener('play', () => {
      this.isPlaying = true;
      this.store.selectAnnotation(null);
      this.updatePlayPauseButton();
    });

    this.video.addEventListener('pause', () => {
      this.isPlaying = false;
      this.updatePlayPauseButton();
    });

    // Ajouter les écouteurs pour le hover
    this.videoContainer.addEventListener('mouseenter', () => {
      if (!this.videoContainer.classList.contains('pin-cursor')) {
        this.showControls();
      }
    });

    this.videoContainer.addEventListener('mouseleave', () => {
      this.startHideControlsTimer();
    });

    this.videoContainer.addEventListener('mousemove', () => {
      if (!this.videoContainer.classList.contains('pin-cursor')) {
        this.showControls();
        this.startHideControlsTimer();
      }
    });
  }

  showControls() {
    if (this.controlsTimeout) {
      clearTimeout(this.controlsTimeout);
    }
    this.controlsContainer.classList.remove('opacity-0', 'pointer-events-none');
    this.controlsContainer.classList.add('opacity-100', 'pointer-events-auto');
  }

  hideControls() {
    this.controlsContainer.classList.remove('opacity-100', 'pointer-events-auto');
    this.controlsContainer.classList.add('opacity-0', 'pointer-events-none');
  }

  startHideControlsTimer() {
    if (this.controlsTimeout) {
      clearTimeout(this.controlsTimeout);
    }
    this.controlsTimeout = setTimeout(() => {
      this.hideControls();
    }, 500);
  }

  updatePins() {
    // Supprimer tous les pins existants
    const existingPins = this.pinOverlay.querySelectorAll('.pin');
    existingPins.forEach(pin => pin.remove());

    // Afficher uniquement le pin de l'annotation sélectionnée si la vidéo n'est pas en lecture
    if (!this.isPlaying) {
      const selectedAnnotation = this.store.annotations.find(
        ann => ann.id === this.store.selectedAnnotationId
      );

      if (selectedAnnotation?.pinPosition) {
        const pin = document.createElement('div');
        pin.className = 'pin absolute w-6 h-6 -ml-3 -mt-3 text-red-500 transition-all duration-200';
        pin.style.left = `${selectedAnnotation.pinPosition.x}%`;
        pin.style.top = `${selectedAnnotation.pinPosition.y}%`;
        pin.innerHTML = `
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C8.74 0 6 2.74 6 6c0 4.5 6 12 6 12s6-7.5 6-12c0-3.26-2.74-6-6-6zm0 8.25a2.25 2.25 0 1 1 0-4.5 2.25 2.25 0 0 1 0 4.5z"/>
          </svg>
        `;
        this.pinOverlay.appendChild(pin);
      }
    }
  }

  togglePlay() {
    if (this.isPlaying) {
      this.video.pause();
    } else {
      this.video.play();
    }
  }

  skip(seconds) {
    this.video.currentTime += seconds;
  }

  updatePlayPauseButton() {
    this.playPauseBtn.innerHTML = this.isPlaying
      ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>'
      : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="7 3 21 12 7 21 7 3"></polygon></svg>';
  }
}