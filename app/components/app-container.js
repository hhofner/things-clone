import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { on } from '@ember/object/evented';
import { alias } from '@ember/object/computed';
import velocity from 'velocity-animate';
import {
  EKMixin,
  EKOnInsertMixin,
  keyDown,
  keyUp
} from 'ember-keyboard';

export default Component.extend(EKMixin, EKOnInsertMixin, {
  taskEditor: service(),
  taskSelector: service(),
  classNames: ['l-container'],
  isEditMode: alias('taskEditor.hasTask'),

  shortcutCreateTask: on(keyDown('KeyN'), function() {
    this.createTask();
  }),

  shortcutEditSelected: on(keyUp('Enter'), function() {
    if (this.taskSelector.hasSelected) {
      this.taskEditor.setCurrentTask(this.taskSelector.selectedTask);
    }
  }),

  shortcutDeleteSelected: on(keyUp('Backspace'), function() {
    if (this.taskSelector.hasSelected) {
      let selectedElement = document.querySelector('.js-task.is-selected');
      velocity(selectedElement, { opacity: 0 }, { duration: 100 });
      velocity(selectedElement, { height: 0 }, { duration: 200, easing: 'easeOutCubic' })
        .then(() => {
          this.deleteSelectedTasks();
        });
    }
  })
});
