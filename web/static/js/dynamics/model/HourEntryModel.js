/**
 * Model class for a hour entry
 * 
 * @constructor
 * @base CommonModel
 */
var HourEntryModel = function() {
  this.initialize();
  this.persistedClassName = "fi.hut.soberit.agilefant.model.HourEntry";
  this.relations = {
    backlog: {},
    story: {},
    task: {},
    user: {}
  };
  
  this.copiedFields = {
    "date": "date",
    "minutesSpent": "minutesSpent",
    "description": "description"
  };
};
HourEntryModel.prototype = new CommonModel();

HourEntryModel.prototype._setData = function(newData) {
  this.id = newData.id;
  this._copyFields(newData);
};

HourEntryModel.prototype._saveData = function(id, changedData) {
  var data = this.serializeFields("hourEntry", changedData);
  var url = "";
  if(id) {
    data.id = id;
    url = "ajax/storeEffortEntry.action";
  } else if(this.relations.backlog instanceof BacklogModel) {
    url = "ajax/logBacklogEffort.action";
    data.parentObjectId = this.relations.backlog.getId();
  } else if(this.relations.story instanceof StoryModel) {
    url = "ajax/logStoryEffort.action";
    data.parentObjectId = this.relations.story.getId();
  } else if(this.relations.task instanceof TaskModel) {
    url = "ajax/logTaskEffort.action";
    data.parentObjectId = this.relations.task.getId();
  }
  if(this.tmpUsers) {
    var userIds = [];
    for(var i = 0; i < this.tmpUsers.length; i++) {
      userIds.push(this.tmpUsers[i].getId());
    }
    data.userIds = userIds;
  }
  $.ajax({
    type: "POST",
    url: url,
    async: true,
    cache: false,
    data: data,
    dataType: "json",
    success: function(data, status) {
      MessageDisplay.Ok("Effort entry saved");
      me.setData(data);
    },
    error: function(xhr, status, error) {
      MessageDisplay.Error("Error saving effort entry", xhr);
    }
  });
};

HourEntryModel.prototype.getDate = function() {
  return this.currentData.date;
};

HourEntryModel.prototype.getMinutesSpent = function() {
  return this.currentData.minutesSpent;
};

HourEntryModel.prototype.getDescription = function() {
  return this.currentData.description;
};

HourEntryModel.prototype.setDate = function(date) {
  this.currentData.date = date;
  this._commitIfNotInTransaction();
};

HourEntryModel.prototype.setMinutesSpent = function(minutesSpent) {
  this.currentData.minutesSpent = minutesSpent;
  this._commitIfNotInTransaction();
};

HourEntryModel.prototype.setDescription = function(description) {
  this.currentData.description = description;
  this._commitIfNotInTransaction();
};

//for creating multiple entries
HourEntryModel.prototype.getUsers = function() {
  return this.tmpUsers;
};
HourEntryModel.prototype.setParent = function(parent) {
  if(parent instanceof BacklogModel) {
    this.relations.backlog = parent;
  } else if(parent instanceof StoryModel) {
    this.relations.story = parent;
  } else if(parent instanceof TaskModel) {
    this.relations.task = parent;
  }
};

HourEntryModel.prototype.setUsers = function(userIds, users) {
  if(users) {
    this.tmpUsers = [];
    for(var i = 0; i < users.length; i++) {
      if(!(users[i] instanceof UserModel)) {
        this.tmpUsers.push(ModelFactory.updateObject(users[i]));
      } else {
        this.tmpUsers.push(users[i]);
      }
    }
  }
};

