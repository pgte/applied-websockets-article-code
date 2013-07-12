global.ListCtrl = ListCtrl;

function ListCtrl($scope, Websocket, $routeParams) {

	$scope.newtodo = {};
	$scope.todos = [];

	Websocket.connect($scope, '/list/websocket', function(server) {

		// <-- list
		server.emit('list', $routeParams.listId);

		// --> todos
		server.on('todos', onTodos);

		function onTodos(todos) {
			$scope.todos = todos;
			$scope.$digest();
		}

		// <-- new
		$scope.create = onCreate;

		function onCreate() {
			server.emit('new', $scope.newtodo);
			$scope.newtodo = {};
		}

		// --> new
		server.on('new', onNew);

		function onNew(todo) {
			$scope.todos.unshift(todo);
			$scope.$digest();
		};

		// <-- delete
		$scope.remove = onRemove;

		function onRemove(todo) {
			server.emit('delete', todo.id);
		}

		// --> delete
		server.on('delete', onDelete);

		function onDelete(todoId) {
			var index = find($scope.todos, todoId);
			if (index >= 0) {
				$scope.todos.splice(index, 1);
				$scope.$digest();
			}
		}

		// <-- update

		$scope.toggle = onToggle;

		function onToggle(todo) {
			todo.state = todo.state == 'pending' ? 'done' : 'pending';
			server.emit('update', todo);
		}

		// --> update

		server.on('update', onUpdate);

		function onUpdate(todo) {
			var index = find($scope.todos, todo.id);
			if (index >= 0) {
				$scope.todos[index] = todo;
				$scope.$digest();
			}
		}

	});
}

function find(items, id) {
  for (var i = 0; i < items.length; i++) {
    if (items[i].id == id) return i;
  }
  return -1;
}