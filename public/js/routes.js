app.config(['$routeProvider', function($routeProvider) {
    $routeProvider.

    when('/map', {
       templateUrl: 'templates/MapTemplate.html',
       controller: 'MapController'
    }).

    when('/create_csv/:variable_index', {
       templateUrl: 'templates/CreateCSVTemplate.html',
       controller: 'CreateCSVController'
    }).

    when('/profile', {
       templateUrl: 'templates/ProfileTemplate.html',
       controller: 'ProfileController'
    }).

    when('/view_model/:model_index', {
       templateUrl: 'templates/ViewModelTemplate.html',
       controller: 'ViewModelController'
    }).

    when('/project', {
       templateUrl: 'project',
       controller: 'ProjectController'
    }).

    when('/view_project/:project_id', {
       templateUrl: 'viewProject',
       controller: 'ViewProjectController'
    }).

    when('/edit_project/:project_id', {
       templateUrl: 'editProject',
       controller: 'EditProjectController'
    }).

    when('/', {
       templateUrl: 'templates/IndexTemplate.html',
       controller: 'IndexController'
    }).

     otherwise({
       redirectTo: '/'
    });
}]);