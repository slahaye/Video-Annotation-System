import { formatDistance } from 'date-fns';

export class AnnotationList {
  constructor(element, store) {
    this.element = element;
    this.store = store;
    this.store.addListener(() => this.render());
    this.initialize();
    this.render();
  }

  initialize() {
    // Create overlay for delete confirmation
    this.deleteOverlay = document.createElement('div');
    this.deleteOverlay.className = 'delete-confirmation-overlay';
    document.body.appendChild(this.deleteOverlay);

    // Event delegation for reply forms
    this.element.addEventListener('submit', (e) => {
      if (e.target.classList.contains('reply-form')) {
        e.preventDefault();
        const textarea = e.target.querySelector('textarea');
        const text = textarea.value.trim();
        const errorMessage = e.target.querySelector('.error-message');
        
        if (!text) {
          errorMessage.style.display = 'block';
          return;
        }
        
        const annotationId = e.target.closest('.annotation-item').dataset.annotationId;
        this.store.addReply(annotationId, text);
        textarea.value = '';
        errorMessage.style.display = 'none';
      } else if (e.target.classList.contains('edit-reply-form')) {
        e.preventDefault();
        const textarea = e.target.querySelector('textarea');
        const text = textarea.value.trim();
        const errorMessage = e.target.querySelector('.error-message');
        
        if (!text) {
          errorMessage.style.display = 'block';
          return;
        }
        
        const annotationId = e.target.closest('.annotation-item').dataset.annotationId;
        const replyId = e.target.dataset.replyId;
        this.store.updateReply(annotationId, replyId, text);
        e.target.classList.add('hidden');
      }
    });

    // Event delegation for reply actions
    this.element.addEventListener('click', (e) => {
      const replyContainer = e.target.closest('.reply-container');
      if (!replyContainer) return;

      const annotationId = replyContainer.closest('.annotation-item').dataset.annotationId;
      const replyId = replyContainer.querySelector('.reply-actions').dataset.replyId;

      if (e.target.closest('.edit-reply-btn')) {
        const form = replyContainer.querySelector('.edit-reply-form');
        form.classList.remove('hidden');
      } else if (e.target.closest('.delete-reply-btn')) {
        this.showDeleteConfirmation(annotationId, replyId);
      } else if (e.target.closest('.cancel-edit-reply')) {
        const form = replyContainer.querySelector('.edit-reply-form');
        const textarea = form.querySelector('textarea');
        textarea.value = textarea.dataset.originalText;
        form.classList.add('hidden');
      }
    });

    // Close delete confirmation when clicking outside
    this.deleteOverlay.addEventListener('click', (e) => {
      if (e.target === this.deleteOverlay) {
        this.hideDeleteConfirmation();
      }
    });
  }

  showDeleteConfirmation(annotationId, replyId) {
    this.deleteOverlay.innerHTML = `
      <div class="delete-confirmation">
        <p class="text-lg font-medium text-gray-900 mb-4">Delete Reply</p>
        <p class="text-sm text-gray-600 mb-6">Are you sure you want to delete this reply? This action cannot be undone.</p>
        <div class="flex justify-center gap-3">
          <button class="confirm-delete px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors">
            Delete
          </button>
          <button class="cancel-delete px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    `;

    this.deleteOverlay.classList.add('visible');

    // Add event listeners for the new buttons
    this.deleteOverlay.querySelector('.confirm-delete').addEventListener('click', () => {
      this.store.deleteReply(annotationId, replyId);
      this.hideDeleteConfirmation();
    });

    this.deleteOverlay.querySelector('.cancel-delete').addEventListener('click', () => {
      this.hideDeleteConfirmation();
    });
  }

  hideDeleteConfirmation() {
    this.deleteOverlay.classList.remove('visible');
  }

  createAnnotationElement(annotation) {
    const isSelected = annotation.id === this.store.selectedAnnotationId;
    const hasPinIcon = annotation.pinPosition ? `
      <span class="text-red-500 mr-1 inline-flex items-center">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3" fill="white"/>
        </svg>
      </span>
    ` : '';

    const replies = annotation.replies.map(reply => `
      <div class="reply-container pl-6 mt-2 border-l-2 border-gray-100">
        <div class="reply-content flex items-start justify-between relative">
          <div class="flex-1">
            <div class="mb-1">
              <span class="text-sm font-medium text-gray-900">${reply.user.name} :</span>
            </div>
            <p class="text-sm text-gray-900">${reply.text}</p>
            <p class="text-xs text-gray-500 mt-1">
              ${formatDistance(reply.createdAt, new Date(), { addSuffix: true })}
              ${reply.updatedAt > reply.createdAt ? ' (edited)' : ''}
            </p>
          </div>
          <div class="reply-actions ml-2" data-reply-id="${reply.id}">
            ${reply.user.id === this.store.currentUser.id ? `
              <button class="edit-reply-btn p-1 text-gray-400 hover:text-blue-500 transition-colors">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                </svg>
              </button>
              <button class="delete-reply-btn p-1 text-gray-400 hover:text-red-500 transition-colors">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            ` : ''}
          </div>
        </div>
        <form class="edit-reply-form hidden mt-2" data-reply-id="${reply.id}">
          <textarea
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            rows="2"
            data-original-text="${reply.text}"
          >${reply.text}</textarea>
          <div class="error-message text-xs text-red-500 mt-1">Please enter some text for your reply.</div>
          <div class="flex justify-end gap-2 mt-2">
            <button type="button" class="cancel-edit-reply px-2 py-1 text-xs text-gray-600 hover:text-gray-800">
              Cancel
            </button>
            <button type="submit" class="px-2 py-1 text-xs text-white bg-blue-500 rounded hover:bg-blue-600">
              Save
            </button>
          </div>
        </form>
      </div>
    `).join('');

    return `
      <div class="annotation-item p-4 hover:bg-gray-50 transition-colors ${isSelected ? 'selected' : ''}" data-annotation-id="${annotation.id}">
        <div class="flex items-start justify-between">
          <div class="cursor-pointer flex-1">
            <div class="mb-1">
              <span class="text-sm font-medium text-gray-900">${annotation.user.name} :</span>
            </div>
            <p class="text-sm text-gray-900 font-medium flex items-center">
              ${hasPinIcon}${annotation.text}
            </p>
            <div class="flex items-center gap-2 mt-1 text-sm text-gray-500">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>${this.formatTime(annotation.timestamp)}</span>
              <span class="text-gray-400">•</span>
              <span>${formatDistance(annotation.updatedAt, new Date(), { addSuffix: true })}</span>
            </div>
          </div>
          
          <div class="flex items-center gap-2 ml-4">
            ${annotation.user.id === this.store.currentUser.id ? `
              <button
                onclick="(() => {
                  const editModal = document.getElementById('edit-modal');
                  const annotation = window.annotationStore.annotations.find(a => a.id === '${annotation.id}');
                  if (annotation) {
                    window.editAnnotationModal.open(annotation);
                  }
                })()"
                class="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                title="Edit annotation"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                </svg>
              </button>
              <button
                onclick="window.annotationStore.deleteAnnotation('${annotation.id}')"
                class="p-1 text-gray-400 hover:text-red-500 transition-colors"
                title="Delete annotation"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            ` : ''}
          </div>
        </div>

        <div class="mt-3">
          ${replies}
          ${isSelected ? `
            <form class="reply-form mt-3">
              <textarea
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                rows="2"
                placeholder="Add a reply..."
              ></textarea>
              <div class="error-message text-xs text-red-500 mt-1" style="display: none;">Please enter some text for your reply.</div>
              <div class="flex justify-end mt-2">
                <button type="submit" class="px-3 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600">
                  Reply
                </button>
              </div>
            </form>
          ` : ''}
        </div>
      </div>
    `;
  }

  render() {
    if (this.store.annotations.length === 0) {
      this.element.innerHTML = `
        <div class="p-4 text-center text-gray-500">
          No annotations yet. Add one by clicking the button above the timeline.
        </div>
      `;
      return;
    }

    this.element.innerHTML = this.store.annotations
      .map(annotation => this.createAnnotationElement(annotation))
      .join('');

    // Add click handlers after rendering
    this.element.querySelectorAll('.annotation-item').forEach(item => {
      const annotationId = item.dataset.annotationId;
      
      // Add selected class if this is the selected annotation
      if (annotationId === this.store.selectedAnnotationId) {
        item.classList.add('selected');
        // Scroll the item into view if it's selected
        setTimeout(() => {
          item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 50);
      }

      item.addEventListener('click', (e) => {
        // Ne pas déclencher si on clique sur un bouton ou un formulaire
        if (e.target.closest('button') || e.target.closest('form')) {
          return;
        }
        
        const annotation = this.store.annotations.find(a => a.id === annotationId);
        if (annotation) {
          document.querySelector('video').currentTime = annotation.timestamp;
          this.store.setCurrentTime(annotation.timestamp);
          this.store.selectAnnotation(annotationId);
        }
      });
    });
  }

  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}