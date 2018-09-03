import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import { set, computed } from '@ember/object';
import { on } from '@ember/object/evented';
import { EKMixin, EKOnInsertMixin, keyDown, keyUp } from 'ember-keyboard';
import move from 'ember-animated/motions/move';
import { easeOut, easeIn } from 'ember-animated/easings/cosine';

export default Component.extend(EKMixin, EKOnInsertMixin, {
  router: service(),
  itemSelector: service(),
  taskEditor: service(),
  classNames: ['l-container'],
  isShortcutsDialogOpen: false,
  isMoveDialogOpen: false,
  isDeadlineDialogOpen: false,
  isEditing: alias('taskEditor.hasTask'),
  hasSelected: alias('itemSelector.hasItems'),
  hasSelectedProjects: alias('itemSelector.hasProjects'),
  folders: Object.freeze(['inbox', 'today', 'anytime', 'someday']),

  canCreateTask: computed('router.currentRouteName', 'isEditing', function() {
    return !this.isEditing && !['logbook', 'trash'].includes(this.router.currentRouteName);
  }),

  shortcutNewTask: on(keyDown('KeyN'), function() {
    this.createNewTask();
  }),

  shortcutShortcutsDialog: on(keyDown('shift+Slash'), function() {
    this.toggleShortcutsDialog();
  }),

  shortcutDeleteSelected: on(keyUp('Backspace'), function() {
    this.deleteSelected();
  }),

  actions: {
    toggleShortcutsDialog() {
      this.toggleShortcutsDialog();
    },

    toggleDeadlineDialog() {
      this.toggleDeadlineDialog();
    },

    toggleMoveDialog() {
      this.toggleMoveDialog();
    },

    createNewTask() {
      this.createNewTask();
    },

    deleteSelected() {
      this.deleteSelected();
    },

    setDeadline(deadline) {
      if (!this.hasSelected) {
        return;
      }

      this.toggleDeadlineDialog();
      this.setItemsDeadline(this.itemSelector.items, deadline);
    },

    moveSelectedToFolder(folder) {
      if (!this.hasSelected || this.hasSelectedProjects) {
        return;
      }

      this.toggleMoveDialog();
      this.moveTasksToFolder(this.itemSelector.items, folder);
    },

    moveSelectedToProject(project) {
      if (!this.hasSelected || this.hasSelectedProjects) {
        return;
      }

      this.toggleMoveDialog();

      if (project) {
        this.moveTasksToProject(this.itemSelector.items, project);
      } else {
        this.removeTasksFromProject(this.itemSelector.items);
      }
    }
  },

  toggleDeadlineDialog() {
    set(this, 'isDeadlineDialogOpen', !this.isDeadlineDialogOpen);
  },

  toggleShortcutsDialog() {
    set(this, 'isShortcutsDialogOpen', !this.isShortcutsDialogOpen);
  },

  toggleMoveDialog() {
    if (this.hasSelectedProjects) {
      return;
    }

    set(this, 'isMoveDialogOpen', !this.isMoveDialogOpen);
  },

  createNewTask() {
    if (!this.canCreateTask) {
      return;
    }

    this.createTask().then(newTask => {
      this.itemSelector.selectOnly(newTask);
      setTimeout(() => this.taskEditor.edit(newTask));
    });
  },

  deleteSelected() {
    if (!this.hasSelected) {
      return;
    }

    this.deleteItems(this.itemSelector.items);
    this.itemSelector.clear();
  },

  * transition({ insertedSprites, removedSprites }) {
    insertedSprites.forEach(sprite => {
      sprite.startAtPixel({ y: window.innerHeight });
      move(sprite, { easing: easeOut });
    });

    removedSprites.forEach(sprite => {
      sprite.endAtPixel({ y: window.innerHeight });
      move(sprite, { easing: easeIn });
    });
  }
});
