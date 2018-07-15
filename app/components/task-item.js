import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend({
  taskEditor: service(),
  taskSelector: service(),
  classNames: ['c-task'],
  classNameBindings: ['isSelected', 'isEditable'],
  task: null,
  placeholder: 'New To-Do',

  isEditable: computed('taskEditor.currentTask', function() {
    return this.taskEditor.isCurrent(this.task);
  }),

  isSelected: computed('taskSelector.selectedTask', function() {
    return this.taskSelector.isSelected(this.task);
  }),

  init() {
    this._super(...arguments);
    this.handleRootClick = this.handleRootClick.bind(this);
  },

  didRender() {
    this._super(...arguments);

    if (this.isEditable) {
      this.autofocus();
      this.startHandlingRootClick();
    } else {
      this.stopHandlingRootClick();
    }
  },

  actions: {
    onEnter() {
      this.stopEditing();
    },

    toggleTask(isDone) {
      if (isDone) {
        this.completeTask(this.task);
      } else {
        this.uncompleteTask(this.task);
      }
    }
  },

  click(event) {
    this.selectTask(event);
  },

  doubleClick() {
    this.startEditing();
  },

  autofocus() {
    let input = this.element.querySelector('.js-task-input');

    if (input) {
      input.focus();
    }
  },

  selectTask({ target }) {
    if (target.classList.contains('js-checkbox') || this.isSelected) {
      return;
    }

    this.taskSelector.select(this.task);
  },

  startEditing() {
    if (!this.isEditable) {
      this.taskEditor.setCurrentTask(this.task);
    }
  },

  stopEditing() {
    if (this.isEditable) {
      this.taskEditor.setCurrentTask(null);
      this.saveTask(this.task);
    }
  },

  startHandlingRootClick() {
    document.addEventListener('click', this.handleRootClick, true);
  },

  stopHandlingRootClick() {
    document.removeEventListener('click', this.handleRootClick, true);
  },

  handleRootClick(event) {
    let isInternalClick = this.element.contains(event.target);

    if (!isInternalClick) {
      this.stopEditing();
    }
  }
});
