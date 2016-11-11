app.controller("ProfileController", ["$scope", "$http", "localStorageService", function ($scope, $http, localStorageService) {
    angular.extend($scope, {
        variables: [],
        models: [],
        popupAddVariable: {
            show: false, 
            top: 0,
            left: 0
        }
    });

    $scope.deleteModel = function(key) {
        $scope.models.splice(key,1);
        var xhr = new XMLHttpRequest;
        var url =  window.globals.API_ENDPOINT + 'delete_model/' + key;
        console.log(url);
        xhr.open('POST', url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Token", getLocalStorageValue('token'));

        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (JSON.parse(xhr.response).status === "ok") {
                    console.log('ok');
                }
                else {
                    console.log('not ok');
                }
            }
        };
        xhr.send();
    }

    $scope.addModel = function() {
        window.location = window.globals.CLIENT_ENDPOINT + 'map';
    }

    $scope.deleteVariable = function(key) {
        $scope.variables.splice(key,1);
        var xhr = new XMLHttpRequest;
        var url =  window.globals.API_ENDPOINT + 'delete_variable/' + key;
        console.log(url);
        xhr.open('POST', url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Token", getLocalStorageValue('token'));

        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (JSON.parse(xhr.response).status === "ok") {
                    console.log('ok');
                }
                else {
                    console.log('not ok');
                }
            }
        };
        xhr.send();
    }

    $scope.goToVariable = function(key) {
        console.log(key);
         window.location = window.globals.CLIENT_ENDPOINT + 'create_csv/' + key;
    }

    $scope.goToModel = function(key) {
        window.location = window.globals.CLIENT_ENDPOINT + 'view_model/' + key;
    }

    $scope.hidePopupAddVariable = function() {
        $scope.popupAddVariable.show = false;
    }

    $scope.goToCreateNewCSV = function() {
        setLocalStorageValue('importedVariableCSV',undefined);
        window.location = window.globals.CLIENT_ENDPOINT + 'create_csv/-1';
    }

    $scope.importCSV = function() {
        window.location = window.globals.CLIENT_ENDPOINT + 'create_csv/-1';
    }

    $scope.addVariable = function(e) {
        $scope.popupAddVariable.show = true;
        $scope.popupAddVariable.left = e.clientX - 188;
        $scope.popupAddVariable.top = e.clientY;
    }

    $scope.createProject = function() {
        var xhr = new XMLHttpRequest;
        var url =  window.globals.API_ENDPOINT + 'new_project';
        console.log(url);
        xhr.open('POST', url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Token", getLocalStorageValue('token'));

        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (JSON.parse(xhr.response).status === "ok") {
                    window.location = window.globals.CLIENT_ENDPOINT + 'edit_project/' + JSON.parse(xhr.response).project_id;
                }
                else {
                    console.log('not ok');
                }
            }
        };

        var body = {
            name: $scope.newProject.name,
            description: $scope.newProject.description
        }
        xhr.send(JSON.stringify(body));
    }

    $scope.viewProject = function(project_id) {
        window.location = window.globals.CLIENT_ENDPOINT + 'view_project/' + project_id;
    };

    $scope.editProject = function(project_id) {
        window.location = window.globals.CLIENT_ENDPOINT + 'edit_project/' + project_id;
    };

    function setLocalStorageValue(key, val) {
       return localStorageService.set(key, val);
    }

    function getLocalStorageValue(key) {
       return localStorageService.get(key);
    }

    function clearKeys(key) {
       return localStorageService.clearAll(/^\d+$/);
    }
      function clearAll() {
       return localStorageService.clearAll();
    }

    $scope.hoverImportButton = function() {
        console.log('hoverImportButton');
        document.getElementById('importCSVButton').style.backgroundColor = '#60C0C0';
        document.getElementById('importCSVButton').style.color = 'white';
    }

    $scope.removeHoverImportButton = function() {
        console.log('hoverImportButton');
        document.getElementById('importCSVButton').style.backgroundColor = null;
        document.getElementById('importCSVButton').style.color = null;
    }

    $scope.importCSVVariable = function() {
        var files = document.getElementById('importCSVVariable').files;
        if (files[0] !== undefined) {
            var reader=new FileReader();
            reader.onload=function(e){
                var string=reader.result;

                //do what you want with obj !
                var lines = string.split('\n');
                if(lines.length === 1) {
                    lines = string.split('\r');
                }
                var points = [];
                _.each(lines, function(line, index) {
                    var data = line.split(',');
                    console.log(data[0]);
                    var timeB = parseInt(data[0]);
                    var timeE = parseInt(data[1]);
                    var lat = parseFloat(data[2]);
                    var lng = parseFloat(data[3]);
                    var valueF = parseInt(data[4]);
                    var radius = parseInt(data[5]);
                    var nameP = data[6];
                    var value = {
                        timeB: timeB,
                        timeE: timeE,
                        point: {
                            coordinates: [lat, lng]
                        },
                        value: valueF,
                        radius: radius,
                        name:nameP
                    };
                    /*if(lines.length !== 0) {
                        radius = parseInt(5000/lines.length);
                    }*/
                    if (!isNaN(timeB) && !isNaN(timeE) && !isNaN(lat) && !isNaN(lng))  {
                        points.push(value);
                    }
                });
                console.log(points);
                var variable = {
                    name: files[0].name,
                    points: points
                }
                setLocalStorageValue('importedVariableCSV',variable);
                window.location = window.globals.CLIENT_ENDPOINT + 'create_csv/-1';
            }
            reader.readAsText(files[0]);
        }
    }

    $scope.initialize = function () {
        var xhr = new XMLHttpRequest;
        var url =  window.globals.API_ENDPOINT + 'refresh_info';
        console.log(url);
        xhr.open('POST', url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Token", getLocalStorageValue('token'));

        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (JSON.parse(xhr.response).status === "ok") {
                    console.log(JSON.parse(xhr.response));
                    localStorageService.set('variables', JSON.parse(xhr.response).variables);
                    localStorageService.set('models', JSON.parse(xhr.response).models);
                    console.log('$scope.models',$scope.models);
                    $scope.$apply(function () {
                        $scope.variables = getLocalStorageValue('variables');
                        $scope.models = getLocalStorageValue('models');
                    });
                }
                else {
                    console.log('not ok');
                }
            }
        };
        xhr.send();
        
    }

    $scope.initialize();

}]);