var App = angular.module('ToodooApp', []);

App.config(function($locationProvider, $routeProvider) {
  $locationProvider.html5Mode(true);

  $routeProvider.
    when('/', {
      templateUrl: '/partials/index.html'
    }).
    when('/lists/new', {
      templateUrl: '/partials/new.html',
      controller: 'NewListCtrl'
    }).
    when('/lists/:listId', {
      templateUrl: '/partials/list.html',
      controller: 'ListCtrl'
    });
});


/// Web Sockets

var reconnect = require('reconnect');
var duplexEmitter = require('duplex-emitter');

App.factory('Websocket', function() {

  function connect(scope, path, cb) {
    var r =
    reconnect(function(stream) {

      scope.$on('$destroy', function() {
        r.reconnect = false;
        stream.end();
      });

      var server = duplexEmitter(stream);
      cb(server);
    }).connect(path);
  }

  return {
    connect: connect
  };

});