export class EditAnnotationModal {
  constructor(id, store) {
    this.modal = document.getElementById(id);
    this.store = store;
    this.form = this.modal.querySelector('form');
    this.pinPosition = null;
    this.currentAnnotation = null;
    this.cursorElement = null;
    this.originalTimestamp = null;
    this.initialize();
  }

  initialize() {
    // Close modal buttons
    this.modal.querySelectorAll('.close-modal').forEach(button => {
      button.addEventListener('click', () => this.close());
    });

    // Add pin button
    const addPinBtn = this.modal.querySelector('.add-pin-btn');
    const removePinBtn = this.modal.querySelector('.remove-pin-btn');
    
    if (addPinBtn) {
      addPinBtn.addEventListener('click', () => {
        // Cache temporairement la modal et le pin actuel
        this.modal.style.display = 'none';
        this.store.selectAnnotation(null);
        
        const videoPlayer = document.querySelector('video').parentElement;
        const controlsContainer = videoPlayer.querySelector('.bg-gradient-to-t');
        
        // Désactiver les contrôles vidéo
        controlsContainer.classList.remove('opacity-100', 'pointer-events-auto');
        controlsContainer.classList.add('opacity-0', 'pointer-events-none');
        
        videoPlayer.classList.add('pin-cursor');
        
        // Créer l'élément de curseur personnalisé
        this.cursorElement = document.createElement('div');
        this.cursorElement.className = 'custom-cursor';
        document.body.appendChild(this.cursorElement);
        
        const handleMouseMove = (e) => {
          if (this.cursorElement) {
            this.cursorElement.style.left = `${e.clientX}px`;
            this.cursorElement.style.top = `${e.clientY}px`;
          }
        };
        
        const handlePinPlacement = (e) => {
          const rect = videoPlayer.getBoundingClientRect();
          this.pinPosition = {
            x: ((e.clientX - rect.left) / rect.width) * 100,
            y: ((e.clientY - rect.top) / rect.height) * 100
          };
          
          // Réaffiche la modal
          this.modal.style.display = 'flex';
          
          // Update pin preview
          const pinPreviewContainer = this.modal.querySelector('.pin-preview-container');
          const pinPreview = this.modal.querySelector('.pin-preview');
          if (pinPreview && pinPreviewContainer) {
            pinPreview.textContent = `Pin placé à ${Math.round(this.pinPosition.x)}%, ${Math.round(this.pinPosition.y)}%`;
            pinPreviewContainer.classList.add('visible');
          }

          // Update add pin button text
          const btnText = addPinBtn.querySelector('span');
          btnText.lastChild.textContent = ' Edit pin';
          
          // Show remove pin button
          if (removePinBtn) {
            removePinBtn.classList.remove('hidden');
          }
          
          // Reset cursor and remove event listeners
          videoPlayer.classList.remove('pin-cursor');
          videoPlayer.removeEventListener('click', handlePinPlacement);
          document.removeEventListener('mousemove', handleMouseMove);
          
          // Supprimer l'élément de curseur personnalisé
          if (this.cursorElement) {
            this.cursorElement.remove();
            this.cursorElement = null;
          }
        };

        document.addEventListener('mousemove', handleMouseMove);
        videoPlayer.addEventListener('click', handlePinPlacement);
      });
    }

    // Remove pin button
    if (removePinBtn) {
      removePinBtn.addEventListener('click', () => {
        this.pinPosition = null;
        this.currentAnnotation.pinPosition = null;
        this.store.selectAnnotation(null);
        
        // Update pin preview
        const pinPreviewContainer = this.modal.querySelector('.pin-preview-container');
        if (pinPreviewContainer) {
          pinPreviewContainer.classList.remove('visible');
        }

        // Update add pin button text
        const btnText = addPinBtn.querySelector('span');
        btnText.lastChild.textContent = ' Add pin';

        // Hide remove pin button
        removePinBtn.classList.add('hidden');
      });
    }

    // Form submission
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const textArea = this.form.querySelector('#edit-annotation-text');
      const text = textArea.value.trim();
      const id = this.form.querySelector('#edit-annotation-id').value;
      const timestampInput = this.form.querySelector('#edit-timestamp');
      const errorMessage = this.form.querySelector('.error-message');

      if (!text) {
        errorMessage.classList.add('visible');
        textArea.classList.add('border-red-500');
        return;
      }

      errorMessage.classList.remove('visible');
      textArea.classList.remove('border-red-500');
      
      // Utiliser le timestamp original si la valeur n'a pas été modifiée
      const timestamp = Number(timestampInput.value) === this.originalTimestamp 
        ? this.originalTimestamp 
        : Number(timestampInput.value);

      const finalPinPosition = this.pinPosition !== null ? this.pinPosition : this.currentAnnotation?.pinPosition;
      this.store.updateAnnotation(id, text, timestamp, finalPinPosition);
      this.store.selectAnnotation(id);
      this.close();
    });

    // Reset error state on input
    const textArea = this.form.querySelector('#edit-annotation-text');
    textArea.addEventListener('input', () => {
      const errorMessage = this.form.querySelector('.error-message');
      errorMessage.classList.remove('visible');
      textArea.classList.remove('border-red-500');
    });

    // Update timestamp label when range input changes
    const timestampInput = this.form.querySelector('#edit-timestamp');
    const timestampLabel = this.form.querySelector('#edit-timestamp-label');
    
    if (timestampInput && timestampLabel) {
      timestampInput.addEventListener('input', (e) => {
        const value = Number(e.target.value);
        const minutes = Math.floor(value / 60);
        const seconds = Math.floor(value % 60);
        const milliseconds = Math.round((value % 1) * 1000);
        timestampLabel.textContent = `Timestamp: ${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
      });
    }
  }

  open(annotation) {
    if (!annotation) return;
    
    this.currentAnnotation = { ...annotation };
    this.pinPosition = null;
    this.originalTimestamp = annotation.timestamp;
    
    const video = document.querySelector('video');
    const timestampInput = this.form.querySelector('#edit-timestamp');
    
    if (video && video.duration) {
      timestampInput. max = video.duration.toString();
      timestampInput.step = "0.001"; // Permettre une précision milliseconde
    }

    this.form.querySelector('#edit-annotation-id').value = annotation.id;
    this.form.querySelector('#edit-annotation-text').value = annotation.text;
    timestampInput.value = this.originalTimestamp;

    const minutes = Math.floor(this.originalTimestamp / 60);
    const seconds = Math.floor(this.originalTimestamp % 60);
    const milliseconds = Math.round((this.originalTimestamp % 1) * 1000);
    this.form.querySelector('#edit-timestamp-label').textContent = 
      `Timestamp: ${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;

    // Reset error state
    const errorMessage = this.form.querySelector('.error-message');
    const textArea = this.form.querySelector('#edit-annotation-text');
    errorMessage.classList.remove('visible');
    textArea.classList.remove('border-red-500');

    // Reset et mise à jour du pin preview
    const pinPreviewContainer = this.modal.querySelector('.pin-preview-container');
    const pinPreview = this.modal.querySelector('.pin-preview');
    if (pinPreview && pinPreviewContainer) {
      pinPreviewContainer.classList.remove('visible');
      
      if (annotation.pinPosition) {
        pinPreview.textContent = `Pin existant à ${Math.round(annotation.pinPosition.x)}%, ${Math.round(annotation.pinPosition.y)}%`;
        pinPreviewContainer.classList.add('visible');
      }
    }

    // Mettre à jour le texte du bouton en fonction de la présence d'un pin
    const addPinBtn = this.modal.querySelector('.add-pin-btn');
    const removePinBtn = this.modal.querySelector('.remove-pin-btn');
    if (addPinBtn && removePinBtn) {
      const btnText = addPinBtn.querySelector('span');
      btnText.lastChild.textContent = annotation.pinPosition ? ' Edit pin' : ' Add pin';
      
      if (annotation.pinPosition) {
        removePinBtn.classList.remove('hidden');
      } else {
        removePinBtn.classList.add('hidden');
      }
    }

    this.modal.style.display = 'flex';
  }

  close() {
    this.modal.style.display = 'none';
    this.pinPosition = null;
    const videoPlayer = document.querySelector('video').parentElement;
    videoPlayer.classList.remove('pin-cursor');
    
    if (this.cursorElement) {
      this.cursorElement.remove();
      this.cursorElement = null;
    }
    
    if (this.currentAnnotation?.id) {
      this.store.selectAnnotation(this.currentAnnotation.id);
    }
  }
}