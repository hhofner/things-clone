import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { hasMany } from 'ember-data/relationships';
import { set, computed } from '@ember/object';
import { or, alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import moment from 'moment';

export default Model.extend({
  name: attr('string'),
  order: attr('number', { defaultValue: 0 }),
  isCompleted: attr('boolean', { defaultValue: false }),
  isDeleted: attr('boolean', { defaultValue: false }),
  deadline: attr('date'),
  completedAt: attr('date'),
  deletedAt: attr('date'),

  createdAt: attr('date', {
    defaultValue() {
      return new Date();
    }
  }),

  tasks: hasMany('task'),

  currentDate: alias('clock.date'),
  isCompletedOrDeleted: or('isCompleted', 'isDeleted'),
  isShownInTrash: alias('isDeleted'),

  activeTasks: computed('tasks.[]', 'tasks.@each.{isCompleted,isDeleted}', function() {
    return this.tasks.filter(task => !task.isCompleted && !task.isDeleted);
  }),

  progress: computed('tasks.[]', 'tasks.@each.{isCompleted,isDeleted}', function() {
    let activeTasks = this.tasks.filter(task => !task.isDeleted);
    let completedTasks = activeTasks.filter(task => task.isCompleted);
    let activeTasksCount = activeTasks.length;
    let completedTasksCount = completedTasks.length;

    if (activeTasksCount === 0 || completedTasksCount === 0) {
      return 0;
    }

    return 100 / (activeTasksCount / completedTasksCount);
  }),


  isShownInAnytime: computed(
    'isCompletedOrDeleted',
    'tasks.[]',
    'tasks.@each.{isShownInAnytime}',
    function() {
      return !this.isCompletedOrDeleted && this.tasks.any(task => task.isShownInAnytime);
    }
  ),

  isShownInSomeday: computed(
    'isCompletedOrDeleted',
    'tasks.[]',
    'tasks.@each.{isShownInSomeday}',
    function() {
      return !this.isCompletedOrDeleted && this.tasks.any(task => task.isShownInSomeday);
    }
  ),

  isShownInLogbook: computed('isCompleted', 'isDeleted', function() {
    return this.isCompleted && !this.isDeleted;
  }),

  logbookGroup: computed('completedAt', function() {
    return moment(this.completedAt).calendar(null, {
      sameDay: '[Today]',
      lastDay: '[Yesterday]',
      lastWeek: 'MMMM',
      sameElse: 'MMMM'
    });
  }),

  completedAtDisplay: computed('completedAt', function() {
    return moment(this.completedAt).calendar(null, {
      sameDay: '[Today]',
      lastDay: '[Yesterday]',
      lastWeek: 'MMM DD',
      sameElse: 'MMM DD'
    });
  }),

  daysLeft: computed('currentDate', 'deadline', function() {
    if (!this.deadline) {
      return 0;
    }

    // Ignoring time
    let date = new Date(this.currentDate.toDateString());
    return moment(date).diff(this.deadline, 'days') * -1;
  }),

  isDeadline: computed('daysLeft', function() {
    return this.daysLeft <= 0;
  }),

  deadlineDisplay: computed('daysLeft', function() {
    let days = Math.abs(this.daysLeft);
    let lastWord = this.daysLeft > 0 ? 'left' : 'ago';

    if (days === 0) {
      return 'today';
    }

    return `${days} day${days === 1 ? '' : 's'} ${lastWord}`;
  }),

  clock: service(),
  isProject: true,

  complete() {
    set(this, 'isCompleted', true);
    set(this, 'completedAt', new Date());
  },

  delete() {
    set(this, 'isDeleted', true);
    set(this, 'deletedAt', new Date());
  },

  undelete() {
    set(this, 'isDeleted', false);
  },

  uncomplete() {
    set(this, 'isCompleted', false);
  }
});
