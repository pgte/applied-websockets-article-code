var duplexEmitter = require('duplex-emitter');
var store = require('../store');
var uuid = require('node-uuid').v4;
var rooms = require('./rooms');

module.exports =
function listWebsocketServer(stream) {
  var client = duplexEmitter(stream);

  var listId;
  var room;

  // --> list

  client.on('list', onList);

  function onList(id) {
    listId = id;
    room = rooms.room(listId);
    room.add(client, stream);
    var todos = store.get(id);
    client.emit('todos', todos);
  }

  // --> new

  client.on('new', onNew);

  function onNew(todo) {

    // assign an id to the item
    todo.id = uuid();

    // set it to pending
    todo.state = 'pending';

    // store item
    var items = store.get(listId);
    items.unshift(todo);

    // send new to the client
    room.broadcast('new', todo);
  }

  // --> delete

  client.on('delete', onDelete);

  function onDelete(id) {
    var items = store.get(listId);

    // try to find the item in the list
    var index = find(items, id);

    // if the item is found, remove it
    if (index >= 0) {
      items.splice(index, 1);
      room.broadcast('delete', id);
    }
  }

  // --> update

  client.on('update', onUpdate);

  function onUpdate(todo) {
    var items = store.get(listId);
    var index = find(items, todo.id);
    if (index >= 0) {
      items[index] = todo;
      room.broadcast('update', todo);
    }
  }
}

function find(items, id) {
  for (var i = 0; i < items.length; i++) {
    if (items[i].id == id) return i;
  }
  return -1;
}