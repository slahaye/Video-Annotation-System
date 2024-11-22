export class Timeline {
  constructor(element, store) {
    this.element = element;
    this.store = store;
    this.isDragging = false;

    this.progressBar = element.querySelector('#progress-bar');
    this.cursorHandle = element.querySelector('#cursor-handle');
    this.timeIndicator = element.querySelector('#time-indicator');
    this.timelineBar = element.querySelector('.w-full.h-2');

    this.addEventListeners();
    this.store.addListener(() => this.update());
  }

  addEventListeners() {
    this.element.addEventListener('mousedown', (e) => {
      if (!e.target.classList.contains('annotation-marker')) {
        this.isDragging = true;
        this.updateTimeFromPosition(e.clientX);
        this.store.selectAnnotation(null);
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        this.updateTimeFromPosition(e.clientX);
        this.store.selectAnnotation(null);
      }
    });

    document.addEventListener('mouseup', () => {
      this.isDragging = false;
    });
  }

  updateTimeFromPosition(clientX) {
    const rect = this.timelineBar.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const newTime = percentage * (document.querySelector('video').duration || 3600);
    this.store.setCurrentTime(newTime);
    document.querySelector('video').currentTime = newTime;
  }

  update() {
    const duration = document.querySelector('video').duration || 3600;
    const percentage = (this.store.currentTime / duration) * 100;
    
    this.progressBar.style.width = `${percentage}%`;
    this.cursorHandle.style.left = `${percentage}%`;
    this.timeIndicator.textContent = this.formatTime(this.store.currentTime);
    
    // Update annotation markers
    const existingMarkers = this.element.querySelectorAll('.annotation-marker');
    existingMarkers.forEach(marker => marker.remove());

    this.store.annotations.forEach(annotation => {
      const marker = document.createElement('div');
      marker.className = 'annotation-marker bg-yellow-400 rounded-full cursor-pointer';
      const markerPosition = (annotation.timestamp / duration) * 100;
      marker.style.left = `${markerPosition}%`;
      marker.dataset.annotationId = annotation.id;
      marker.title = annotation.text;
      
      marker.addEventListener('click', (e) => {
        e.stopPropagation();
        this.store.setCurrentTime(annotation.timestamp);
        document.querySelector('video').currentTime = annotation.timestamp;
        this.store.selectAnnotation(annotation.id);
      });
      
      this.timelineBar.appendChild(marker);
    });
  }

  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}