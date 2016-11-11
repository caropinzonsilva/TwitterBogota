app.controller("ViewModelController", ["$scope", "$http", "$routeParams", "localStorageService", "$filter", function ($scope, $http, $routeParams, localStorageService, $filter) {
    angular.extend($scope, {
        map: {
            /*center: {
                lat: 41.84080,
                lng: -87.539936,
                zoom: 11
            },*/
            center: {
                lat: 4.638023343989493,
                lng: -74.10484313964844,
                zoom: 12
            },
            year: "now",
            prev_layer: null,
            geoJson: {
                "type": "FeatureCollection",
                "features": []
            },
            point_radius: 5,
            showLayers: true,
            showDateScale: true,
            layers: [{
                name: "Estratos de Barrios",
                points: [],
                color: '6C2A6A',
                selected: true,
                opacity: 0.5,
                values: []
            },{
                name: "Crímenes",
                points: [],
                color: 'EB403B',
                selected: true,
                opacity: 0.5,
                values: []
            },{
                name: "Estaciones de Transmilenio",
                points: [],
                color: 'FBB735',
                selected: true,
                opacity: 0.5,
                values: []
            },{
                name: "Cines",
                points: [],
                color: '689E2E',
                selected: true,
                opacity: 0.5,
                values: []
            },{
                name: "Universidades",
                points: [],
                color: '00636B',
                selected: true,
                opacity: 0.5,
                values: []
            },{
                name: "Estaciones de Bomberos",
                points: [],
                color: '39C0B3',
                selected: true,
                opacity: 0.5,
                values: []
            }]
        },
        dateRange: {
           dateInt: 365,
           date: moment().format('MMM DD, YYYY'),
           time: moment().valueOf(),
           months: [],
           moveRight: 0,
           monthNames: ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC']
        },
        showDialogs: {
            addCVS: true,
            fillAddLayerIcon: '',
            layerName: false,
            cursorAddLayerIcon: '',
            layerAccuracy: true,
            candidates: true,
            explorar: false,
            heatmapColors: true
        },
        loading: {
            show: false,
            rotation: 0
        },
        file: {
            name: '',
            array: [],
            points: [],
            checked: true,
            continuous: true,
            discrete: false,
            result: [],
            accuracy: 50,
            accuracyColor: "#446688",
            numberSuggestions: 4,
            radius: 700, 
            tiempo: 1,
            index: -1,
            predictions: []
        },
        newContextVariables: [],
        colors: [
            'F44336',
            'E91E63',
            '9C27B0',
            '673AB7',
            '3F51B5',
            '2196F3',
            '03A9F4',
            '00BCD4',
            '009688',
            '4CAF50',
            '8BC34A',
            'CDDC39',
            'FFEB3B',
            'FFC107',
            'FF9800',
            'FF5722'
        ],
        candidates: [],
        proyectos: []
    });

    $scope.showCandidate = function(key) {

    }

    $scope.deleteCandidate = function(key) {
        $scope.candidates.splice(key, 1);
    }

    var debouncedReload = _.debounce(changeLayers, 500);

    $scope.changeDateInt = function () {
        var w = window.innerWidth - 70;//Width of inpyt type range
        var left = w/365 * $scope.dateRange.dateInt;
        document.getElementById('rangeDateValue').style.left = left;
        var dateString = intToDate($scope.dateRange.dateInt);
        $scope.dateRange.date = dateString.string;
        $scope.dateRange.time = dateString.date.valueOf();
        //requestData(now);
        debouncedReload();
    };

    $scope.changeLayers = function() {
        addPointsNewCSV();
        _.each($scope.map.layers, function(layer, index) {
            requestData(index,$scope.dateRange.time);
        });
    }

    $scope.changeOpacity = function(element) {
        console.log(element.value.name);
        if (element.value.name !== 'Estratos de Barrios') {
            removePointOfLayer(element.value);
            showPointsOfLayer(element.value);
        }
        else {
            removePointOfLayer(element.value);
            showRegionsOfLayer(element.value);
        }
    }

    $scope.changeNewLayers = function(element) {
        if(element.value.selected) {
            filterPointsOfLayer(element.value);
        }
        else {
            removePointOfLayer(element.value);
        }
    }

    $scope.hideDialogs = function() {
        //$scope.showDialogs.addCVS = false;
    }

    $scope.showAddLayerDialog = function() {
        if(!$scope.showDialogs.layerName) {
            $scope.showDialogs.addCVS = true;
        }
    }

    $scope.showSelectYear = function() {
        ExpandSelect(document.getElementById('selectMapYear'));
    }

    $scope.changeShowFile = function() {
        if($scope.file.checked) {//Show points
            addPointsNewCSV();
        }
        else {//Hide points
            _.each($scope.file.points, function(point) {
                map.removeLayer(point);
            });
        }
    }

    $scope.downloadCSVModel = function() {
        console.log('downloadCSVModel');
        var csvRows = [];
        csvRows.push('Candidatos');
        csvRows.push('lat, lng, radio, prediccion');
        _.each($scope.model.response.candidatesResult,function(candidate) {
            var lat = (candidate.i1 + candidate.i2)/2;
            var lng = (candidate.j1 + candidate.j2)/2;
            var prediccion = candidate.classPredicted;
            var radio = $scope.model.response.radius;
            var geocoder = new google.maps.Geocoder;
            var latlng = {
                lat: lat,
                lng: lng
            }
            csvRows.push(lat + ', ' + lng + ', ' + radio + ', ' + prediccion);
        })
        var sugerencias = angular.copy($scope.model.response.suggestions).concat($scope.model.response.secundarySuggestions);
        csvRows.push('Sugerencias');
        csvRows.push('lat, lng, radio, prediccion');
        var suggestions = 
        _.each(sugerencias,function(candidate) {
            var lat = (candidate.i1 + candidate.i2)/2;
            var lng = (candidate.j1 + candidate.j2)/2;
            var prediccion = 5;
            var radio = $scope.model.response.radius;
            var geocoder = new google.maps.Geocoder;
            var latlng = {
                lat: lat,
                lng: lng
            }
            csvRows.push(lat + ', ' + lng + ', ' + radio + ', ' + prediccion);
        })
        console.log(csvRows);
        var csvString = csvRows.join("\n");
        var a         = document.createElement('a');
        a.href        = 'data:attachment/csv,' +  encodeURIComponent(csvString);
        a.target      = '_blank';
        a.download    = $scope.model.name + '.csv';

        document.body.appendChild(a);
        a.click();
    }

    function showPointsOfLayer(layer) {
        var values = layer.values;
        var color = layer.color;
        var radius = 700;
        var opacity = layer.opacity;
        if(values.length !== 0) {
            radius = parseInt(5000/values.length);
        }
        radius = 10;
        _.each(values, function(value){
            var circle;
            if(value.point !== undefined) {
                circle = L.circle(value.point.coordinates, radius, {
                    color: '#' + color,//Border Color
                    fillColor: '#' + color,
                    borderOpacity: 1,
                    fillOpacity: opacity,
                    opacity: opacity
                }).addTo(map);
            }
            else {
                circle = L.circle([value.lat,value.lng], radius, {
                    color: '#' + color,//Border Color
                    fillColor: '#' + color,
                    borderOpacity: 1,
                    fillOpacity: opacity,
                    opacity: opacity
                }).addTo(map);
            }
            circle.bindPopup(layer.name + ': ' + value.value);
            layer.points.push(circle);
        })
    }

    function showRegionsOfLayer(layer) {
        var values = layer.values;
        var color = layer.color;
        var opacity = layer.opacity;
         _.each(values, function(value){
            console.log(value.point.coordinates[0]);
            var polygon = L.polygon(value.point.coordinates[0],{
                color: "#6C2A6A",
                opacity: opacity,
                fillColor: 'transparent',
                weight: 1
            }).addTo(map);
            layer.points.push(polygon);
            polygon.bringToBack();
            //console.log(value);
            polygon.bindPopup("Estrato: " + value.value);
        })
    }

    function filterPointsOfLayer(layer) {
        var values = layer.values;
        var color = layer.color;
        var radius = 700;
        if(values.length !== 0) {
            radius = parseInt(5000/values.length);
        }
        _.each(values, function(value){
            var circle = L.circle([value.lat, value.lng], radius, {
                color: '#' + color,//Border Color
                fillColor: '#' + color,
                borderOpacity: 1,
                fillOpacity: 0.5
            }).addTo(map);
            circle.bindPopup(layer.name + ': ' + value.value);
            layer.points.push(circle);
        })
    }

    function removePointOfLayer(layer) {
        _.each(layer.points, function(point) {
            map.removeLayer(point);
        });
        layer.points = [];
    }

    function addPointsNewCSV() {
        //if($scope.file.checked) {
            console.log('addPointsNewCSV');
            _.each($scope.file.points, function(point) {
                map.removeLayer(point);
            });
            //console.log($scope.file.array);
            var filter = _.filter($scope.file.array, function(point) {
                return (point.time == 0) || ($scope.dateRange.time >= point.timeB && point.timeE == 0) || ($scope.dateRange.time <= point.timeE && $scope.dateRange.time > point.timeB);
            });
            //console.log(filter);
            /*if($scope.file.continuous) {//Show All
                var filter = _.filter($scope.file.array, function(point) {
                    return $scope.dateRange.time >= point.time;
                });
            }
            else {//Filter
                var filter = _.filter($scope.file.array, function(point) {
                    return $scope.dateRange.time <= point.time && $scope.dateRange.time > point.time - 86400000;
                });
            }*/
            /*if(filter.length !== 0) {
                radius = parseInt(5000/filter.length);
            }*/
            _.each(filter, function(point) {
                var radius = point.radius;
                console.log(point);
                var circle = L.circle(point.point.coordinates, radius, {
                    color: 'black',//Border Color
                    fillColor: 'black',
                    borderOpacity: 1,
                    fillOpacity: 0.5
                }).addTo(map);
                $scope.file.points.push(circle);
                circle.bringToBack();
            });
        //}
    }

    function changeLayers() {
        $scope.changeLayers();
    }

    function requestData(index,time) {
        if(index == 0) {
            $http({
                method: 'GET',
                url: window.globals.API_ENDPOINT + 'regions/' + index + '?t=' + time
            }).then(function successCallback(response) {
                var layer = $scope.map.layers[index];
                    layer.values = response.data;
                console.log(response.data);
                //var markers = L.markerClusterGroup();
                //markers.addLayer(L.geoJson(response.data));
                //map.addLayer(markers);
            }, function errorCallback(response) {
                
            });
        }
        else {
            $http({
                method: 'GET',
                url: window.globals.API_ENDPOINT + 'map/' + index + '?t=' + time
            }).then(function successCallback(response) {
                var layer = $scope.map.layers[index];
                    layer.values = response.data;
                if(index == 0) {
                    showRegionsOfLayer(layer);
                }
                else {
                  //showData(response.data, index);
                    removePointOfLayer(layer);
                    showPointsOfLayer(layer);  
                }
            }, function errorCallback(response) {
                
            });
        }
    }

    //Map
    var map = L.map('map').setView([$scope.map.center.lat, $scope.map.center.lng], $scope.map.center.zoom);
    L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
        zoomControl: false,
        //attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">JS</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();
    map.keyboard.disable();

    new L.Control.Zoom({ position: 'bottomright' }).addTo(map);
    L.control.scale({ 
        position: 'bottomleft',
        imperial: false
    }).addTo(map);
    document.getElementById('map2').style.width = window.innerWidth + 'px';
    console.log(window.innerWidth + 'px');
    var map2 = L.map('map2').setView([$scope.map.center.lat, $scope.map.center.lng], $scope.map.center.zoom);
    L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
        zoomControl: false,
        //attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">JS</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map2);
    map2.touchZoom.disable();
    map2.doubleClickZoom.disable();
    map2.scrollWheelZoom.disable();
    map2.keyboard.disable();
    
    map.dragging._draggable._updatePosition = function () {
        console.log('draged');
        L.Draggable.prototype._updatePosition.call(this);
        L.DomUtil.setPosition(map2.dragging._draggable._element, this._newPos);
    };
    map2.dragging._draggable._updatePosition = function () {
        console.log('draged');
        L.Draggable.prototype._updatePosition.call(this);
        L.DomUtil.setPosition(map.dragging._draggable._element, this._newPos);
        /*map.setView(map2.getCenter(), map2.getZoom(), {
            animate: false,
            reset: false
        });
        map.fire('moveend');*/
    };
    map.on('zoomanim', function (event) {
        map2.fire('zoomstart');
        map2.setView(map.getCenter(), event.zoom, {
            animate: true,
            reset: false
        });
    }, this);
    map2.on('zoomanim', function (event) {
        map.fire('zoomstart');
        map.setView(map2.getCenter(), event.zoom, {
            animate: true,
            reset: false
        });
    }, this);

    document.getElementById('map2Container').addEventListener('mousedown',function(e) {
        document.documentElement.addEventListener('mousemove', doDrag, false);
        document.documentElement.addEventListener('mouseup', stopDrag, false);
    },false);

    function doDrag(e) {
        var width = window.innerWidth - e.clientX;
        document.getElementById('map2Container').style.width = width + 'px';
    }

    function stopDrag(e) {
        document.documentElement.removeEventListener('mousemove', doDrag, false);
        document.documentElement.removeEventListener('mouseup', stopDrag, false);
    }

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

    function initialize() {
        
        $scope.variables = getLocalStorageValue('variables');
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

                    initMap2();
                }
                else {
                    console.log('not ok');
                }
            }
        };
        xhr.send();

        header = document.querySelector("header");
        if (!classie.has(header,"smaller")) {
            classie.add(header,"smaller");
        }

        /*var now = moment().valueOf();
        requestData(0,now);*/
        $scope.changeLayers();

        
    }

    function initMap2() {
        var models = getLocalStorageValue('models');
        var index = parseInt($routeParams.model_index);
        var model = models[index];
        $scope.model = model;
        console.log(models,index,model);

        //x, y, radius, startAngle, endAngle

        var color;

        /*var colors = {
            0: 'grey',
            1: '#7EBFDD',
            2: '#799CD9',
            3: '#7A82D9',
            4: '#8665D5',
            5: '#B82EC6'
        }*/
        var colors = {
            0: 'grey',
            1: '#5F145F',
            2: '#6B3E98',
            3: '#4CA8F3',
            4: '#2DFEFF',
            5: 'white'
        }
        color = colors[5];
        var arrayHeatMap = [];
        for (var i = model.response.suggestions.length - 1; i >= 0; i--) {
            model.response.suggestions[i]
            var lat = (model.response.suggestions[i].i1 + model.response.suggestions[i].i2)/2;
            var lng = (model.response.suggestions[i].j1 + model.response.suggestions[i].j2)/2;
            var radius = $scope.file.radius;
            var polygon = L.polygon([
                [model.response.suggestions[i].i1, model.response.suggestions[i].j1],
                [model.response.suggestions[i].i1, model.response.suggestions[i].j2],
                [model.response.suggestions[i].i2, model.response.suggestions[i].j2],
                [model.response.suggestions[i].i2, model.response.suggestions[i].j1]
            ]);
            polygon.setStyle({
                color: 'transparent',//Border Color
                fillColor: color,
                borderOpacity: 0,
                fillOpacity: 0.6
            });
            polygon.addTo(map2);
            /*var circle = L.circle([lat, lng], radius, {
                color: 'transparent',//Border Color
                fillColor: color,
                borderOpacity: 0,
                fillOpacity: 0.6
            }).addTo(map2);
            circle.bindPopup('Sugerencia');
            $scope.file.result.push(circle);*/
            //arrayHeatMap.push([lat,lng,1]);
        }
        for (var i = model.response.secundarySuggestions.length - 1; i >= 0; i--) {
            model.response.secundarySuggestions[i]
            var lat = (model.response.secundarySuggestions[i].i1 + model.response.secundarySuggestions[i].i2)/2;
            var lng = (model.response.secundarySuggestions[i].j1 + model.response.secundarySuggestions[i].j2)/2;
            var polygon = L.polygon([
                [model.response.secundarySuggestions[i].i1, model.response.secundarySuggestions[i].j1],
                [model.response.secundarySuggestions[i].i1, model.response.secundarySuggestions[i].j2],
                [model.response.secundarySuggestions[i].i2, model.response.secundarySuggestions[i].j2],
                [model.response.secundarySuggestions[i].i2, model.response.secundarySuggestions[i].j1]
            ]);
            polygon.setStyle({
                color: 'transparent',//Border Color
                fillColor: color,
                borderOpacity: 0,
                fillOpacity: 0.6
            });
            polygon.addTo(map2);
            /*var radius = $scope.file.radius;
            var circle = L.circle([lat, lng], radius, {
                color: 'transparent',//Border Color
                fillColor: color,
                borderOpacity: 0,
                fillOpacity: 0.6
            }).addTo(map2);
            circle.bindPopup('Sugerencia');
            $scope.file.result.push(circle);*/
            //arrayHeatMap.push([lat,lng,0.7]);
        }
        color = colors[4];
        for (var i = model.response.suggestions4.length - 1; i >= 0; i--) {
            model.response.suggestions4[i]
            var lat = (model.response.suggestions4[i].i1 + model.response.suggestions4[i].i2)/2;
            var lng = (model.response.suggestions4[i].j1 + model.response.suggestions4[i].j2)/2;
            var radius = $scope.file.radius;
            /*var circle = L.circle([lat, lng], radius, {
                color: 'transparent',//Border Color
                fillColor: color,
                borderOpacity: 0,
                fillOpacity: 0.5
            }).addTo(map2);
            circle.bindPopup('Sugerencia');
            $scope.file.result.push(circle);*/
            var polygon = L.polygon([
                [model.response.suggestions4[i].i1, model.response.suggestions4[i].j1],
                [model.response.suggestions4[i].i1, model.response.suggestions4[i].j2],
                [model.response.suggestions4[i].i2, model.response.suggestions4[i].j2],
                [model.response.suggestions4[i].i2, model.response.suggestions4[i].j1]
            ]);
            polygon.setStyle({
                color: 'transparent',//Border Color
                fillColor: color,
                borderOpacity: 0,
                fillOpacity: 0.4
            });
            polygon.addTo(map2);
            //arrayHeatMap.push([lat,lng,1]);
        }
        color = colors[3];
        for (var i = model.response.suggestions3.length - 1; i >= 0; i--) {
            model.response.suggestions3[i]
            var lat = (model.response.suggestions3[i].i1 + model.response.suggestions3[i].i2)/2;
            var lng = (model.response.suggestions3[i].j1 + model.response.suggestions3[i].j2)/2;
            /*var radius = $scope.file.radius;
            var circle = L.circle([lat, lng], radius, {
                color: 'transparent',//Border Color
                fillColor: color,
                borderOpacity: 0,
                fillOpacity: 0.4
            }).addTo(map2);
            circle.bindPopup('Sugerencia');
            $scope.file.result.push(circle);*/
            var polygon = L.polygon([
                [model.response.suggestions3[i].i1, model.response.suggestions3[i].j1],
                [model.response.suggestions3[i].i1, model.response.suggestions3[i].j2],
                [model.response.suggestions3[i].i2, model.response.suggestions3[i].j2],
                [model.response.suggestions3[i].i2, model.response.suggestions3[i].j1]
            ]);
            polygon.setStyle({
                color: 'transparent',//Border Color
                fillColor: color,
                borderOpacity: 0,
                fillOpacity: 0.3
            });
            polygon.addTo(map2);
            //arrayHeatMap.push([lat,lng,1]);
        }
        color = colors[2];
        for (var i = model.response.suggestions2.length - 1; i >= 0; i--) {
            model.response.suggestions2[i]
            var lat = (model.response.suggestions2[i].i1 + model.response.suggestions2[i].i2)/2;
            var lng = (model.response.suggestions2[i].j1 + model.response.suggestions2[i].j2)/2;
            /*var radius = $scope.file.radius;
            var circle = L.circle([lat, lng], radius, {
                color: 'transparent',//Border Color
                fillColor: color,
                borderOpacity: 0,
                fillOpacity: 0.3
            }).addTo(map2);
            circle.bindPopup('Sugerencia');
            $scope.file.result.push(circle);*/
            var polygon = L.polygon([
                [model.response.suggestions2[i].i1, model.response.suggestions2[i].j1],
                [model.response.suggestions2[i].i1, model.response.suggestions2[i].j2],
                [model.response.suggestions2[i].i2, model.response.suggestions2[i].j2],
                [model.response.suggestions2[i].i2, model.response.suggestions2[i].j1]
            ]);
            polygon.setStyle({
                color: 'transparent',//Border Color
                fillColor: color,
                borderOpacity: 0,
                fillOpacity: 0.2
            });
            polygon.addTo(map2);
            //arrayHeatMap.push([lat,lng,1]);
        }
        color = colors[1];
        for (var i = model.response.suggestions1.length - 1; i >= 0; i--) {
            model.response.suggestions1[i]
            var lat = (model.response.suggestions1[i].i1 + model.response.suggestions1[i].i2)/2;
            var lng = (model.response.suggestions1[i].j1 + model.response.suggestions1[i].j2)/2;
            /*var radius = $scope.file.radius;
            var circle = L.circle([lat, lng], radius, {
                color: 'transparent',//Border Color
                fillColor: color,
                borderOpacity: 0,
                fillOpacity: 0.2
            }).addTo(map2);
            circle.bindPopup('Sugerencia');
            $scope.file.result.push(circle);*/
            var polygon = L.polygon([             
                [model.response.suggestions1[i].i1, model.response.suggestions1[i].j1],
                [model.response.suggestions1[i].i1, model.response.suggestions1[i].j2],
                [model.response.suggestions1[i].i2, model.response.suggestions1[i].j2],
                [model.response.suggestions1[i].i2, model.response.suggestions1[i].j1]
            ]);
            polygon.setStyle({
                color: 'transparent',//Border Color
                fillColor: color,
                borderOpacity: 0,
                fillOpacity: 0.1
            });
            polygon.addTo(map2);
            //arrayHeatMap.push([lat,lng,1]);
        }
        var circles = [];
        for (var i = 0; i < model.response.candidatesResult.length; i++) {
            var lat = (model.response.candidatesResult[i].i1 + model.response.candidatesResult[i].i2)/2;
            var lng = (model.response.candidatesResult[i].j1 + model.response.candidatesResult[i].j2)/2;
            var radius = model.response.radius;
            console.log(model.response.candidatesResult[i]);
            var color = colors[model.response.candidatesResult[i].classPredicted];
            var circle = L.circle([lat, lng], radius, {
                color: 'white',//Border Color
                fillColor: color,
                borderOpacity: 0.6,
                fillOpacity: 0.6
            }).addTo(map2);
            circle.bindPopup('Predicción: ' + model.response.candidatesResult[i].classPredicted);
            console.log(circle);
        }

        color = "#EB403B";
        if(model.response.accuracy > 0.5 && model.response.accuracy <= 0.6) {
            color = "#FBB735";
        }
        else if(model.response.accuracy > 0.6) {
            color = "#689E2E";
        }

        $scope.$apply(function () {
            $scope.file.accuracy = parseInt(model.response.accuracy*100);
            $scope.file.accuracyColor = color;
        });

        document.getElementById("arc1").setAttribute("d", describeArc(35, 35, 30, 0, model.response.accuracy*360));
    }


    initialize();

    function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
        var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    }

    function describeArc(x, y, radius, startAngle, endAngle){

        var start = polarToCartesian(x, y, radius, endAngle);
        var end = polarToCartesian(x, y, radius, startAngle);

        var arcSweep = endAngle - startAngle <= 180 ? "0" : "1";

        var d = [
            "M", start.x, start.y, 
            "A", radius, radius, 0, arcSweep, 0, end.x, end.y
        ].join(" ");

        return d;       
    }

}]);