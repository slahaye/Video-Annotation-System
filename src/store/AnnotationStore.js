export class AnnotationStore {
  constructor() {
    this.annotations = [];
    this.currentTime = 0;
    this.listeners = new Set();
    this.selectedAnnotationId = null;
    this.currentUser = {
      id: 'user1',
      name: 'John Doe'
    };
  }

  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify() {
    this.listeners.forEach(callback => callback());
  }

  addAnnotation(annotation) {
    const newAnnotation = {
      id: crypto.randomUUID(),
      videoId: annotation.videoId,
      text: annotation.text,
      timestamp: annotation.timestamp,
      createdAt: new Date(),
      updatedAt: new Date(),
      pinPosition: annotation.pinPosition || null,
      replies: [],
      user: this.currentUser
    };
    
    this.annotations.push(newAnnotation);
    this.sortAnnotations();
    this.notify();
    return newAnnotation;
  }

  addReply(annotationId, text) {
    const reply = {
      id: crypto.randomUUID(),
      text,
      createdAt: new Date(),
      updatedAt: new Date(),
      user: this.currentUser
    };

    this.annotations = this.annotations.map(ann =>
      ann.id === annotationId
        ? { ...ann, replies: [...ann.replies, reply] }
        : ann
    );

    this.notify();
    return reply;
  }

  updateReply(annotationId, replyId, text) {
    this.annotations = this.annotations.map(ann =>
      ann.id === annotationId
        ? {
            ...ann,
            replies: ann.replies.map(reply =>
              reply.id === replyId
                ? { ...reply, text, updatedAt: new Date() }
                : reply
            )
          }
        : ann
    );
    this.notify();
  }

  deleteReply(annotationId, replyId) {
    this.annotations = this.annotations.map(ann =>
      ann.id === annotationId
        ? { ...ann, replies: ann.replies.filter(reply => reply.id !== replyId) }
        : ann
    );
    this.notify();
  }

  updateAnnotation(id, text, timestamp, pinPosition = null) {
    const updatedAt = new Date();
    this.annotations = this.annotations.map(ann =>
      ann.id === id
        ? { ...ann, text, timestamp, pinPosition, updatedAt }
        : ann
    );
    this.sortAnnotations();
    this.notify();
  }

  updatePinPosition(id, pinPosition) {
    this.annotations = this.annotations.map(ann =>
      ann.id === id
        ? { ...ann, pinPosition, updatedAt: new Date() }
        : ann
    );
    this.notify();
  }

  deleteAnnotation(id) {
    if (this.selectedAnnotationId === id) {
      this.selectedAnnotationId = null;
    }
    this.annotations = this.annotations.filter(ann => ann.id !== id);
    this.notify();
  }

  setCurrentTime(time) {
    this.currentTime = time;
    this.notify();
  }

  selectAnnotation(id) {
    this.selectedAnnotationId = id;
    this.notify();
  }

  sortAnnotations() {
    this.annotations.sort((a, b) => a.timestamp - b.timestamp);
  }
}