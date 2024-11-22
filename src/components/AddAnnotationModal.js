export class AddAnnotationModal {
  constructor(id, store) {
    this.modal = document.getElementById(id);
    this.store = store;
    this.form = this.modal.querySelector('form');
    this.pinPosition = null;
    this.cursorElement = null;
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
        // Cache temporairement la modal
        this.modal.style.display = 'none';
        this.store.selectAnnotation(null); // Masquer les pins existants
        
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

          // Update add pin button text to "Edit pin"
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
      const textArea = this.form.querySelector('textarea');
      const text = textArea.value.trim();
      const errorMessage = this.form.querySelector('.error-message');

      if (!text) {
        errorMessage.classList.add('visible');
        textArea.classList.add('border-red-500');
        return;
      }

      errorMessage.classList.remove('visible');
      textArea.classList.remove('border-red-500');

      const newAnnotation = {
        videoId: 'demo-video',
        text: text,
        timestamp: this.store.currentTime,
        pinPosition: this.pinPosition
      };
      
      const addedAnnotation = this.store.addAnnotation(newAnnotation);
      this.store.selectAnnotation(addedAnnotation.id);
      this.close();
    });

    // Reset error state on input
    const textArea = this.form.querySelector('textarea');
    textArea.addEventListener('input', () => {
      const errorMessage = this.form.querySelector('.error-message');
      errorMessage.classList.remove('visible');
      textArea.classList.remove('border-red-500');
    });
  }

  open() {
    this.form.reset();
    this.pinPosition = null;
    
    // Reset error state
    const errorMessage = this.form.querySelector('.error-message');
    const textArea = this.form.querySelector('textarea');
    errorMessage.classList.remove('visible');
    textArea.classList.remove('border-red-500');
    
    // Reset pin preview
    const pinPreviewContainer = this.modal.querySelector('.pin-preview-container');
    if (pinPreviewContainer) {
      pinPreviewContainer.classList.remove('visible');
    }

    // Reset add pin button text
    const addPinBtn = this.modal.querySelector('.add-pin-btn');
    if (addPinBtn) {
      const btnText = addPinBtn.querySelector('span');
      btnText.lastChild.textContent = ' Add pin';
    }

    // Hide remove pin button
    const removePinBtn = this.modal.querySelector('.remove-pin-btn');
    if (removePinBtn) {
      removePinBtn.classList.add('hidden');
    }
    
    this.modal.style.display = 'flex';
  }

  close() {
    this.modal.style.display = 'none';
    this.pinPosition = null;
    const videoPlayer = document.querySelector('video').parentElement;
    videoPlayer.classList.remove('pin-cursor');
    
    // Supprimer l'élément de curseur personnalisé s'il existe
    if (this.cursorElement) {
      this.cursorElement.remove();
      this.cursorElement = null;
    }
    
    // Reset pin preview
    const pinPreviewContainer = this.modal.querySelector('.pin-preview-container');
    if (pinPreviewContainer) {
      pinPreviewContainer.classList.remove('visible');
    }
  }
}