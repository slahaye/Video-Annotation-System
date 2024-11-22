export class Modal {
  constructor(id, { onSubmit }) {
    this.modal = document.getElementById(id);
    this.form = this.modal.querySelector('form');
    this.onSubmit = onSubmit;
    this.pinPosition = null;

    this.initialize();
  }

  initialize() {
    // Close modal buttons
    this.modal.querySelectorAll('.close-modal').forEach(button => {
      button.addEventListener('click', () => this.close());
    });

    // Add pin button
    const addPinBtn = this.modal.querySelector('.add-pin-btn');
    if (addPinBtn) {
      addPinBtn.addEventListener('click', () => {
        this.startPinning();
      });
    }

    // Form submission
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = this.form.querySelector('textarea').value;
      const id = this.form.querySelector('input[type="hidden"]')?.value;
      const timestamp = this.form.querySelector('input[type="range"]')?.value;

      if (text.trim()) {
        const currentTime = window.annotationStore.currentTime;
        this.onSubmit(text, id, timestamp ? Number(timestamp) : currentTime, this.pinPosition);
        this.close();
      }
    });

    // Update timestamp range and label if they exist
    const timestampInput = this.form.querySelector('input[type="range"]');
    const timestampLabel = this.form.querySelector('#edit-timestamp-label');
    if (timestampInput && timestampLabel) {
      timestampInput.addEventListener('input', (e) => {
        const minutes = Math.floor(e.target.value / 60);
        const seconds = Math.floor(e.target.value % 60);
        timestampLabel.textContent = `Timestamp: ${minutes}:${seconds.toString().padStart(2, '0')}`;
      });
    }
  }

  startPinning() {
    const videoPlayer = document.querySelector('video').parentElement;
    videoPlayer.style.cursor = 'crosshair';
    
    const handlePinPlacement = (e) => {
      const rect = videoPlayer.getBoundingClientRect();
      this.pinPosition = {
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100
      };
      
      // Update pin preview
      const pinPreview = this.modal.querySelector('.pin-preview');
      if (pinPreview) {
        pinPreview.textContent = `Pin placé à ${Math.round(this.pinPosition.x)}%, ${Math.round(this.pinPosition.y)}%`;
        pinPreview.classList.remove('hidden');
      }
      
      // Reset cursor and remove event listener
      videoPlayer.style.cursor = '';
      videoPlayer.removeEventListener('click', handlePinPlacement);
    };

    videoPlayer.addEventListener('click', handlePinPlacement);
  }

  open() {
    this.form.reset();
    this.pinPosition = null;
    
    // Reset pin preview
    const pinPreview = this.modal.querySelector('.pin-preview');
    if (pinPreview) {
      pinPreview.classList.add('hidden');
    }
    
    // Update timestamp range max value
    const timestampInput = this.form.querySelector('input[type="range"]');
    if (timestampInput) {
      const video = document.querySelector('video');
      if (video && video.duration) {
        timestampInput.max = Math.floor(video.duration);
      }
    }
    
    this.modal.style.display = 'flex';
  }

  close() {
    this.modal.style.display = 'none';
    document.querySelector('video').parentElement.style.cursor = '';
  }
}