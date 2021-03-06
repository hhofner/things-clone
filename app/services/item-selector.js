import Service from '@ember/service';
import { notEmpty, filterBy } from '@ember/object/computed';

export default Service.extend({
  items: null,
  projects: filterBy('items', 'isProject'),

  hasItems: notEmpty('items'),
  hasProjects: notEmpty('projects'),

  init() {
    this._super(...arguments);
    this.set('items', []);
  },

  isSelected(item) {
    return this.items.includes(item);
  },

  select(...items) {
    let itemsToSelect = items.filter(item => !this.isSelected(item));
    this.items.pushObjects(itemsToSelect);
  },

  toggle(...items) {
    items.forEach(item => {
      if (this.isSelected(item)) {
        this.deselect(item);
      } else {
        this.select(item);
      }
    });
  },

  selectOnly() {
    this.clear();
    this.select(...arguments);
  },

  deselect(...items) {
    this.items.removeObjects(items);
  },

  clear() {
    this.items.clear();
  }
});
