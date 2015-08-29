var EDITING_KEY = 'EDITING_TODO_ID';

Template.todosItem.helpers({
  checkedClass: function () {
    return this.checked && 'checked';
  },
  editingClass: function () {
    return Session.equals(EDITING_KEY, this._id) && 'editing';
  },
  nbVersions: function () {
    return Todos.findOne(this._id).versions().count();
  }
});

Template.todosItem.events({
  'change [type=checkbox]': function (event) {
    var checked = $(event.target).is(':checked');
    Todos.update(this._id, {$set: {checked: checked}});
    Lists.update(this.listId, {$inc: {incompleteCount: checked ? -1 : 1}});
  },

  'focus input[type=text]': function (event) {
    Session.set(EDITING_KEY, this._id);
  },

  'blur input[type=text]': function (event) {
    if (Session.equals(EDITING_KEY, this._id))
      Todos.update(this._id, {$set: {text: event.target.value}});
    Session.set(EDITING_KEY, null);
  },

  'keydown input[type=text]': function (event) {
    // ESC or ENTER
    if (event.which === 27 || event.which === 13) {
      event.preventDefault();
      event.target.blur();
    }
  },

  // handle mousedown otherwise the blur handler above will swallow the click
  // on iOS, we still require the click event so handle both
  'mousedown .js-delete-item, click .js-delete-item': function () {
    Todos.remove(this._id);
    if (!this.checked)
      Lists.update(this.listId, {$inc: {incompleteCount: -1}});
  }
});