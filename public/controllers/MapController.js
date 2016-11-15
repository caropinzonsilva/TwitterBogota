app.controller("MapController", ["$scope", "$http", "$routeParams", "localStorageService", "$filter", function ($scope, $http, $routeParams, localStorageService, $filter) {
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
                name: "Public",
                points: [],
                color: '5f145f',
                selected: true,
                opacity: 0.5,
                values: []
            },{
                name: "Private",
                points: [],
                color: '60C0C0',
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
            layerAccuracy: false,
            candidates: true,
            explorar: false,
            heatmapColors: false
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
            radius: 1500, 
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
        var dateString = intToDate($scope.dateRange.dateInt);
        $scope.dateRange.date = dateString.string;
        $scope.dateRange.time = dateString.date.valueOf();
        //requestData(now);
        debouncedReload();
    };

    $scope.changeLayers = function() {
        addPointsNewCSV();
        /*_.each($scope.map.layers, function(layer, index) {
            requestData(index,$scope.dateRange.time);
        });*/
		requestData(1,$scope.dateRange.time);
		requestData(2,$scope.dateRange.time);
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

    $scope.newCSV = function() {
        var files = document.getElementById('inputCSV').files;
        if (files[0] !== undefined) {
            $scope.$apply(function() {
                $scope.loading.show = true;
            });
            var interval = setInterval(function() {
                $scope.loading.rotation ++;
                var div = document.getElementById('loading');
                div.style.mozTransform    = 'rotate('+$scope.loading.rotation+'deg)'; 
                div.style.msTransform     = 'rotate('+$scope.loading.rotation+'deg)'; 
                div.style.oTransform      = 'rotate('+$scope.loading.rotation+'deg)'; 
                div.style.transform       = 'rotate('+$scope.loading.rotation+'deg)'; 
                if ($scope.loading.rotation > 360) {
                    $scope.loading.rotation = 0;
                }
                //-ms-transform: rotate({{ loadingRotate }}deg); -webkit-transform: rotate({{ loadingRotate }}deg); transform: rotate({{ loadingRotate }}deg);
            },10);
            var reader=new FileReader();
            reader.onload=function(e){
                var string=reader.result;

                //do what you want with obj !
                var lines = string.split('\n');
                if(lines.length === 1) {
                    lines = string.split('\r');
                }
                _.each(lines, function(line, index) {
                    var data = line.split(',');
                    var timeB = parseInt(data[0]);
                    var timeE = parseInt(data[1]);
                    var lat = parseFloat(data[2]);
                    var lng = parseFloat(data[3]);
                    var value = data[4];
                    var value = {
                        timeB: timeB,
                        timeE: timeE,
                        lat: lat,
                        lng: lng,
                        value: value
                    };
                    var radius = 700;
                    /*if(lines.length !== 0) {
                        radius = parseInt(5000/lines.length);
                    }*/
                    if (!isNaN(timeB) && !isNaN(timeE) && !isNaN(lat) && !isNaN(lng))  {
                        $scope.file.array.push(value);
                    }
                    if(index == lines.length - 1) {
                        $scope.$apply(function() {
                            $scope.loading.show = false;
                            //$scope.showDialogs.addCVS = false;
                            $scope.showDialogs.fillAddLayerIcon = "rgba(98, 98, 98, 0.3)";
                            $scope.showDialogs.cursorAddLayerIcon = "default";
                            $scope.file.name = files[0].name.split('.')[0];
                            $scope.showDialogs.layerName = true;
                        });
                    }
                });
                addPointsNewCSV();
            }
            reader.readAsText(files[0]);
        }
    }

    /*$scope.removeLayer = function() {
        $scope.showDialogs.addCVS = false;
        $scope.showDialogs.fillAddLayerIcon = '';
        $scope.showDialogs.cursorAddLayerIcon = '';
        $scope.file.name = '';
        $scope.showDialogs.layerName = false;
        $scope.showDialogs.layerAccuracy = false;
        $scope.file.array = [];
        _.each($scope.file.points, function(point) {
            map.removeLayer(point);
        });
    };*/

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

    $scope.removeError = function() {
        document.getElementById('sugestionClass').style.border = null;
    }

    $scope.explore = function() {
        document.getElementById('calculandoSugerenciasPopup').style.display = 'flex';
        $scope.showDialogs.layerAccuracy = false;
        _.each($scope.file.result, function(point) {
            map.removeLayer(point);
        })
        var xhr = new XMLHttpRequest;
        var url =  window.globals.API_ENDPOINT + 'explore';
        console.log(url);
        xhr.open('POST', url, true);
        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (JSON.parse(xhr.response).status === "ok") {
                    var polygons = [];
                    document.getElementById('map2Container').style.display = null;
                    $scope.file.index = JSON.parse(xhr.response).index;
                    /*_.each($scope.newContextVariables,function(layer){
                        removePointOfLayer(layer);
                    });
                    _.each($scope.map.layers,function(layer){
                        removePointOfLayer(layer);
                    });
                    _.each($scope.file.points, function(point) {
                        map.removeLayer(point);
                    });*/
                    $scope.showDialogs.layerName = false;
                    $scope.map.showLayers = false;
                    $scope.map.showDateScale = false;
                    document.getElementById('calculandoSugerenciasPopup').style.display = 'none';
                    var response = JSON.parse(xhr.response);
                    $scope.response = response;

                    console.log(response);
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
                    for (var i = response.suggestions.length - 1; i >= 0; i--) {
                        response.suggestions[i]
                        var lat = (response.suggestions[i].i1 + response.suggestions[i].i2)/2;
                        var lng = (response.suggestions[i].j1 + response.suggestions[i].j2)/2;
                        var radius = $scope.file.radius;
                        var polygon = L.polygon([
                            [response.suggestions[i].i1, response.suggestions[i].j1],
                            [response.suggestions[i].i1, response.suggestions[i].j2],
                            [response.suggestions[i].i2, response.suggestions[i].j2],
                            [response.suggestions[i].i2, response.suggestions[i].j1]
                        ]);
                        polygon.setStyle({
                            color: 'transparent',//Border Color
                            fillColor: color,
                            borderOpacity: 0,
                            fillOpacity: 0.6
                        });
                        polygon.addTo(map2);
                        polygons.push(polygon);
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
                    for (var i = response.secundarySuggestions.length - 1; i >= 0; i--) {
                        response.secundarySuggestions[i]
                        var lat = (response.secundarySuggestions[i].i1 + response.secundarySuggestions[i].i2)/2;
                        var lng = (response.secundarySuggestions[i].j1 + response.secundarySuggestions[i].j2)/2;
                        var polygon = L.polygon([
                            [response.secundarySuggestions[i].i1, response.secundarySuggestions[i].j1],
                            [response.secundarySuggestions[i].i1, response.secundarySuggestions[i].j2],
                            [response.secundarySuggestions[i].i2, response.secundarySuggestions[i].j2],
                            [response.secundarySuggestions[i].i2, response.secundarySuggestions[i].j1]
                        ]);
                        polygon.setStyle({
                            color: 'transparent',//Border Color
                            fillColor: color,
                            borderOpacity: 0,
                            fillOpacity: 0.6
                        });
                        polygon.addTo(map2);
                        polygons.push(polygon);
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
                    for (var i = response.suggestions4.length - 1; i >= 0; i--) {
                        response.suggestions4[i]
                        var lat = (response.suggestions4[i].i1 + response.suggestions4[i].i2)/2;
                        var lng = (response.suggestions4[i].j1 + response.suggestions4[i].j2)/2;
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
                            [response.suggestions4[i].i1, response.suggestions4[i].j1],
                            [response.suggestions4[i].i1, response.suggestions4[i].j2],
                            [response.suggestions4[i].i2, response.suggestions4[i].j2],
                            [response.suggestions4[i].i2, response.suggestions4[i].j1]
                        ]);
                        polygon.setStyle({
                            color: 'transparent',//Border Color
                            fillColor: color,
                            borderOpacity: 0,
                            fillOpacity: 0.4
                        });
                        polygon.addTo(map2);
                        polygons.push(polygon);
                        //arrayHeatMap.push([lat,lng,1]);
                    }
                    color = colors[3];
                    for (var i = response.suggestions3.length - 1; i >= 0; i--) {
                        response.suggestions3[i]
                        var lat = (response.suggestions3[i].i1 + response.suggestions3[i].i2)/2;
                        var lng = (response.suggestions3[i].j1 + response.suggestions3[i].j2)/2;
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
                            [response.suggestions3[i].i1, response.suggestions3[i].j1],
                            [response.suggestions3[i].i1, response.suggestions3[i].j2],
                            [response.suggestions3[i].i2, response.suggestions3[i].j2],
                            [response.suggestions3[i].i2, response.suggestions3[i].j1]
                        ]);
                        polygon.setStyle({
                            color: 'transparent',//Border Color
                            fillColor: color,
                            borderOpacity: 0,
                            fillOpacity: 0.3
                        });
                        polygon.addTo(map2);
                        polygons.push(polygon);
                        //arrayHeatMap.push([lat,lng,1]);
                    }
                    color = colors[2];
                    for (var i = response.suggestions2.length - 1; i >= 0; i--) {
                        response.suggestions2[i]
                        var lat = (response.suggestions2[i].i1 + response.suggestions2[i].i2)/2;
                        var lng = (response.suggestions2[i].j1 + response.suggestions2[i].j2)/2;
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
                            [response.suggestions2[i].i1, response.suggestions2[i].j1],
                            [response.suggestions2[i].i1, response.suggestions2[i].j2],
                            [response.suggestions2[i].i2, response.suggestions2[i].j2],
                            [response.suggestions2[i].i2, response.suggestions2[i].j1]
                        ]);
                        polygon.setStyle({
                            color: 'transparent',//Border Color
                            fillColor: color,
                            borderOpacity: 0,
                            fillOpacity: 0.2
                        });
                        polygon.addTo(map2);
                        polygons.push(polygon);
                        //arrayHeatMap.push([lat,lng,1]);
                    }
                    color = colors[1];
                    for (var i = response.suggestions1.length - 1; i >= 0; i--) {
                        response.suggestions1[i]
                        var lat = (response.suggestions1[i].i1 + response.suggestions1[i].i2)/2;
                        var lng = (response.suggestions1[i].j1 + response.suggestions1[i].j2)/2;
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
                            [response.suggestions1[i].i1, response.suggestions1[i].j1],
                            [response.suggestions1[i].i1, response.suggestions1[i].j2],
                            [response.suggestions1[i].i2, response.suggestions1[i].j2],
                            [response.suggestions1[i].i2, response.suggestions1[i].j1]
                        ]);
                        polygon.setStyle({
                            color: 'transparent',//Border Color
                            fillColor: color,
                            borderOpacity: 0,
                            fillOpacity: 0.1
                        });
                        polygon.addTo(map2);
                        polygons.push(polygon);
                        //arrayHeatMap.push([lat,lng,1]);
                    }
                    var circles = [];
                    for (var i = 0; i < response.candidatesResult.length; i++) {
                        var lat = (response.candidatesResult[i].i1 + response.candidatesResult[i].i2)/2;
                        var lng = (response.candidatesResult[i].j1 + response.candidatesResult[i].j2)/2;
                        var radius = $scope.file.radius;
                        console.log(response.candidatesResult[i]);
                        var color = colors[response.candidatesResult[i].classPredicted];
                        var sum = 0;
                        for(var key in response.candidatesResult[i].vector) {
                            sum += response.candidatesResult[i].vector[key];
                        }
                        if(sum == 0) {
                            var color = colors[0];
                        }
                        var circle = L.circle([lat, lng], radius, {
                            color: 'white',//Border Color
                            fillColor: color,
                            borderOpacity: 0.6,
                            fillOpacity: 0.6
                        }).addTo(map2);
                        circle.bindPopup('Predicción: ' + response.candidatesResult[i].classPredicted);
                        circles.push(circle);
                    }

                    color = "#EB403B";
                    if(response.accuracy > 0.5 && response.accuracy <= 0.6) {
                        color = "#FBB735";
                    }
                    else if(response.accuracy > 0.6) {
                        color = "#689E2E";
                    }

                    $scope.$apply(function () {
                        $scope.showDialogs.layerAccuracy = true;
                        $scope.file.accuracy = parseInt(response.accuracy*100);
                        $scope.file.accuracyColor = color;
                        $scope.showDialogs.addCVS = false;
                        $scope.showDialogs.candidates = false;
                        $scope.showDialogs.explorar = false;
                        $scope.showDialogs.heatmapColors = true;
                        $scope.circles = circles;
                        $scope.polygons = polygons;
                    });

                    document.getElementById("arc1").setAttribute("d", describeArc(35, 35, 30, 0, response.accuracy*360));

                    /*console.log(arrayHeatMap.join("],["));
                    var colors = {
                        0: '#80D3DB',
                        0.4: '#7EBFDD',
                        0.7: '#799CD9',
                        0.8: '#7A82D9',
                        0.9: '#8665D5',
                        1: '#B82EC6'
                    }
                    //var colors = {0: '#FF7474', 0.25: '#FFB974', 0.5: '#FFFF74', 0.75: '#7EFF00', 1: '#74E8FF'}
                    console.log($scope.file.radius);
                    var heat = L.heatLayer(arrayHeatMap, {
                        radius: $scope.file.radius/10,
                        gradient: colors,
                        minOpacity: 0.8
                    }).addTo(map2);
                    
                    $scope.$apply(function () {
                        $scope.showDialogs.layerAccuracy = true;
                        $scope.file.accuracy = parseInt(response.accuracy*100);
                        $scope.file.accuracyColor = color;
                    });

                    document.getElementById("arc1").setAttribute("d", describeArc(35, 35, 30, 0, response.accuracy*360));*/
                        
                    //window.location = window.globals.CLIENT_ENDPOINT + 'view_project/' + $scope.project.id;
                }
                else {
                    //console.log('not ok');
                }
            }
        };

        var weights = _.map($scope.map.layers, function(layer) {
            return layer.opacity;
        });

        var otherContextVariables = _.map($scope.newContextVariables,function(variable) {
            return {
                'name': variable.name,
                'points': variable.values,
                'weight': parseFloat(variable.opacity)
            }
        });

        console.log($scope.candidates);
        var candidates = [];
        _.each($scope.candidates, function(candidate){
            var c = {
                name: candidate.name,
                radius: candidate.radius,
                lat: candidate.circle._latlng.lat,
                lng: candidate.circle._latlng.lng
            }
            candidates.push(c);
        })
        var body = {
            points: $scope.file.array,
            radius: $scope.file.radius,
            time: $scope.file.tiempo,
            weights: weights,
            otherContextVariables: otherContextVariables,
            candidates: candidates
        };
        console.log(body);

        xhr.send(JSON.stringify(body));
    }

    $scope.addContextVariable = function() {
        var files = document.getElementById('inputContextVariable').files;
        if (files[0] !== undefined) {
            
            var reader=new FileReader();
            reader.onload=function(e){
                var string=reader.result;

                //do what you want with obj !
                var lines = string.split('\n');
                if(lines.length === 1) {
                    lines = string.split('\r');
                }
                var values = [];
                var color = $scope.colors[$scope.newContextVariables.length];
                _.each(lines, function(line, index) {
                    var data = line.split(',');
                    var timeB = parseInt(data[0]);
                    var timeE = parseInt(data[1]);
                    var lat = parseFloat(data[2]);
                    var lng = parseFloat(data[3]);
                    var valuePoint = data[4];
                    var value = {
                        timeB: timeB,
                        timeE: timeE,
                        lat: lat,
                        lng: lng,
                        value: valuePoint
                    };
                    var points = [];
                    if (!isNaN(timeB) && !isNaN(timeE) && !isNaN(lat) && !isNaN(lng))  {
                        values.push(value);
                    }
                });
                var layer = {
                    name: files[0].name.split('.')[0],
                    selected: true,
                    color: color,
                    values: values,
                    points: [],
                    opacity: 0.5
                };
                $scope.$apply(function() {
                    $scope.newContextVariables.push(layer);
                });
                filterPointsOfLayer(layer);
            }
            reader.readAsText(files[0]);
        }
    }

    $scope.volerAModificar = function() {
        location.reload();
        /*var xhr = new XMLHttpRequest;
        var url =  window.globals.API_ENDPOINT + 'remove';
        console.log(url);
        xhr.open('POST', url, true);
        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                console.log('ok');
            }
        }

        var body = {
            index: $scope.file.index
        };
        console.log(body);

        xhr.send(JSON.stringify(body));

        $scope.changeLayers();
        $scope.showDialogs.layerName = true;
        $scope.map.showLayers = true;
        $scope.map.showDateScale = true;
        $scope.showDialogs.layerAccuracy = false;
        _.each($scope.file.result, function(point) {
            map.removeLayer(point);
        });
        _.each($scope.file.predictions, function(point) {
            map.removeLayer(point);
        })
        _.each($scope.newContextVariables,function(layer){
            showPointsOfLayer(layer);
        })*/
    }

    function showPointsOfLayer(layer) {
		
		if(layer.opacity > 0 && layer.values.length > 0) {
			console.log("showPointsOfLayer");
			var values = layer.values;
			var points=[];
				
			for (var i = 0; i < values.length; i++){
				var lat = values[i].point.coordinates[0];
				var lon = values[i].point.coordinates[1];
				points.push([lat, lon, 1]);
			}
			var heat = L.heatLayer(points, {radius: 10}).addTo(map); 
			layer.points.push(heat);
		}
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
        if(layer) {
            _.each(layer.points, function(point) {
                map.removeLayer(point);
            });
            layer.points = [];
        }
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
		var url = "http://localhost:5000/total";
		if (index == 2) {
			url = "http://localhost:5000/publico";
		}
        
            /*$http({
                method: 'GET',
                //url: window.globals.API_ENDPOINT + 'map/' + index + '?t=' + time
				url:url
            }).then(function successCallback(response) {
                console.log(response);
                var layer = $scope.map.layers[index];
				var temp = [];
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
                
            });*/
    }

    function intToDate(dateInt) {
        var now = moment();
        if ($scope.map.year !== 'now') {
            now.year($scope.map.year).endOf("year");
        }
        now.add(dateInt-364,'days');
        return { 
            string: now.format('MMM DD, YYYY'),
            date: now
        };
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
        position: 'bottomright',
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

    document.getElementById('map2Container').style.display = 'none';

    $scope.slider;
    $scope.initSlider = function() {
        var slider = document.getElementById('slider');

        $scope.slider = noUiSlider.create(slider, {
            start: [4, 18],
            connect: true,
            range: {
                'min': 1,
                'max': 25
            },
            step: 1
        });
    }
	
	$scope.textAnalysis = function() {
		console.log("textAnalysis");
		_.each($scope.candidates,function(candidate, index) {
			var latLng = candidate.circle._latlng;
			var radius = $scope.file.radius;
			var ids_days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    		var ids_months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
    		var count_request  = 0;
    		var count_response = 0;
			var hourS = parseInt($scope.slider.get()[0]);
            var hourE = parseInt($scope.slider.get()[1]);
            for (var k=0; k<12; k++){
				if(document.getElementById(ids_months[k]).checked == true) {
					for (var i=0; i<7; i++){
						if(document.getElementById(ids_days[i]).checked == true) {
							count_request ++;
							var url = "http://localhost:5000/text/" + latLng.lat + "/" + latLng.lng + "/" + radius + "/" + index + "/" + i + "/" + hourS + "/" + hourE + "/"+ k + "/pp";
							$http({
								method: 'GET',
								url: url
							})
							.then(function(response) {
								WordCloud(document.getElementById('worldCloud'), { list: response.data } );
								console.log(response.data);
								document.getElementById('worldCloud').style.zIndex = 10000;
							});
						}	
					}
				}	
			}
		});
			
			
	}
	
	$scope.clear = function() {
		var ids_days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    	var ids_months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
    	for (var k=0; k<12; k++){
			document.getElementById(ids_months[k]).checked= false;
		}
		for (var i=0; i<7; i++){
			document.getElementById(ids_days[i]).checked= false;
		}
		$scope.words = "";
		var public = $scope.map.layers[0];
		public.values = [];
		var private = $scope.map.layers[1];
		private.values = [];
		removePointOfLayer(public);
		removePointOfLayer(private);
		_.each($scope.candidates,function(candidate) {
            map.removeLayer(candidate.circle);
        })
		$scope.candidates= [];
	}

    $scope.loading = false;
	$scope.refresh = function() {
		var word = ($scope.words);
		var oneDaySelected = false;
		var oneMonthSelected = false;
        console.log($scope.slider.get());
        if(!$scope.loading) {
            var hourS = parseInt($scope.slider.get()[0]);
            var hourE = parseInt($scope.slider.get()[1]);
            $scope.loading = true;
    		var ids_days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    		var ids_months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
    		var count_request  = 0;
    		var count_response = 0;
            var public = $scope.map.layers[0];
            public.values = [];
            var private = $scope.map.layers[1];
            private.values = [];
			for (var k=0; k<12; k++){
				if(document.getElementById(ids_months[k]).checked == true) {
					oneMonthSelected=true;
				}
			}
			for (var i=0; i<7; i++){
				if(document.getElementById(ids_days[i]).checked == true) {
					oneDaySelected=true;
				}
			}
			for (var k=0; k<12; k++){
				if(document.getElementById(ids_months[k]).checked == true || oneMonthSelected == false) {
					
					for (var i=0; i<7; i++){
						if(document.getElementById(ids_days[i]).checked == true || oneDaySelected == false) {
							
							count_request ++;
							var url = "http://localhost:5000/datos/" + i + "/" + hourS + "/" + hourE + "/"+ k + "/pp/" + word;
							$http({
								method: 'GET',
								url: url
							})
							.then(function(response) {
								count_response ++;
								removePointOfLayer(public);
								removePointOfLayer(private);
								for(var r = 0; r < response.data.length; r++) {
									var point = response.data[r];
									if(point.type=="0") {
										public.values.push(point);
									}
									else {
										private.values.push(point);
									}
								}
								showPointsOfLayer(public);
								showPointsOfLayer(private);
								if(count_response == count_request) {
									$scope.loading = false;
									console.log("final_respones");
								}
							});
						}	
					}
				}
			}
		}
	}
	$scope.changeRadius = function() {
        _.each($scope.candidates,function(candidate) {
            map.removeLayer(candidate.circle);
            var circle = circle = L.circle(candidate.circle._latlng, $scope.file.radius, {
                color: 'grey',//Border Color
                fillColor: 'grey',
                borderOpacity: 1,
                fillOpacity: 0.5
            }).addTo(map);
            candidate.circle = circle;
        })
    }

    map.on('click', function(e) {
        if(!$scope.showDialogs.heatmapColors) {
            console.log(e.latlng.lat,e.latlng.lng);
            var geocoder = new google.maps.Geocoder;
            var latlng = {
                lat: e.latlng.lat,
                lng: e.latlng.lng
            }
            geocoder.geocode({'location': latlng}, function(results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    var name  = '';
                    if (results[1]) {
                        console.log(results[1].formatted_address);
                        name = results[1].formatted_address.split(', Bogotá')[0];
                    }
                    else {
                        console.log('No results found');
                    }
                    var circle = L.circle([latlng.lat, latlng.lng], $scope.file.radius, {
                        color: 'grey',//Border Color
                        fillColor: 'grey',
                        borderOpacity: 1,
                        fillOpacity: 0.5
                    }).addTo(map);
                    $scope.$apply(function () {
                        $scope.candidates.push({
                            radius: 700, 
                            name: name,
                            circle: circle
                        });
                    });
                }
                else {
                  console.log('Geocoder failed due to: ' + status);
                }
            });
        }
        

    });
    var arrayHeat = [[4.771741000000004,-74.08973100000003,0.7],[4.764741000000004,-74.138731,0.7],[4.771741000000004,-74.14573100000001,0.7],[4.771741000000004,-74.18773099999999,0.7],[4.736741000000004,-74.01273100000006,0.7],[4.729741000000002,-74.131731,0.7],[4.722741000000003,-74.18073100000001,0.7],[4.729741000000002,-74.18773099999999,0.7],[4.715741000000003,-74.00573100000005,0.7],[4.708741000000003,-74.01273100000006,0.7],[4.680741000000003,-74.166731,0.7],[4.680741000000003,-74.18073100000001,0.7],[4.6527410000000025,-74.19473099999999,0.7],[4.638741000000001,-74.02673100000004,0.7],[4.645741000000001,-74.03373100000005,0.7],[4.624741000000002,-74.01273100000006,0.7],[4.631741000000002,-74.01973100000004,0.7],[4.554741,-74.166731,0.7],[4.540741000000001,-74.166731,0.7],[4.764741000000004,-74.05473100000003,0.7],[4.771741000000004,-74.06173100000004,0.7],[4.764741000000004,-74.08273100000002,0.7],[4.750741000000003,-74.01273100000006,0.7],[4.736741000000004,-74.12473100000003,0.7],[4.7437410000000035,-74.131731,0.7],[4.729741000000002,-74.14573100000001,0.7],[4.722741000000003,-74.15273100000002,0.7],[4.715741000000003,-74.01973100000004,0.7],[4.715741000000003,-74.159731,0.7],[4.701741000000002,-74.159731,0.7],[4.701741000000002,-74.173731,0.7],[4.687741000000003,-74.173731,0.7],[4.666741000000002,-74.01273100000006,0.7],[4.6737410000000015,-74.159731,0.7],[4.5967410000000015,-74.19473099999999,0.7],[4.568741000000001,-74.18073100000001,0.7],[4.771741000000004,-74.04773100000003,0.7],[4.701741000000002,-74.14573100000001,0.7],[4.694741000000002,-74.166731,0.7],[4.6737410000000015,-74.01973100000004,0.7],[4.6737410000000015,-74.03373100000005,0.7],[4.540741000000001,-74.12473100000003,0.7],[4.547741,-74.131731,0.7],[4.708741000000003,-74.166731,0.7],[4.680741000000003,-74.02673100000004,0.7],[4.589741,-74.06173100000004,0.7],[4.764741000000004,-74.09673100000003,0.7],[4.757741000000003,-74.01973100000004,0.7],[4.722741000000003,-74.02673100000004,0.7],[4.666741000000002,-74.11073100000002,0.7],[4.638741000000001,-74.11073100000002,0.7],[4.561741,-74.07573100000002,0.7],[4.764741000000004,-74.06873100000004,0.7],[4.757741000000003,-74.11773100000002,0.7],[4.736741000000004,-74.04073100000005,0.7],[4.715741000000003,-74.06173100000004,0.7],[4.680741000000003,-74.15273100000002,0.7],[4.659741000000002,-74.159731,0.7],[4.645741000000001,-74.11773100000002,0.7],[4.7437410000000035,-74.07573100000002,0.7],[4.729741000000002,-74.10373100000001,0.7],[4.708741000000003,-74.05473100000003,0.7],[4.715741000000003,-74.08973100000003,0.7],[4.708741000000003,-74.138731,0.7],[4.701741000000002,-74.01973100000004,0.7],[4.680741000000003,-74.09673100000003,0.7],[4.6527410000000025,-74.15273100000002,0.7],[4.6527410000000025,-74.18073100000001,0.7],[4.582741,-74.19473099999999,0.7],[4.568741000000001,-74.166731,0.7],[4.715741000000003,-74.07573100000002,0.7],[4.694741000000002,-74.02673100000004,0.7],[4.540741000000001,-74.15273100000002,0.7],[4.7437410000000035,-74.04773100000003,0.7],[4.7437410000000035,-74.11773100000002,0.7],[4.701741000000002,-74.03373100000005,0.7],[4.680741000000003,-74.12473100000003,0.7],[4.659741000000002,-74.08973100000003,0.7],[4.554741,-74.11073100000002,0.7],[4.722741000000003,-74.04073100000005,0.7],[4.722741000000003,-74.05473100000003,0.7],[4.722741000000003,-74.06873100000004,0.7],[4.694741000000002,-74.138731,0.7],[4.687741000000003,-74.08973100000003,0.7],[4.687741000000003,-74.14573100000001,0.7],[4.659741000000002,-74.131731,0.7],[4.610741000000001,-74.09673100000003,0.7],[4.603741000000001,-74.159731,0.7],[4.589741,-74.173731,0.7],[4.757741000000003,-74.03373100000005,0.7],[4.750741000000003,-74.04073100000005,0.7],[4.6527410000000025,-74.09673100000003,0.7],[4.659741000000002,-74.10373100000001,0.7],[4.624741000000002,-74.166731,0.7],[4.582741,-74.11073100000002,0.7],[4.568741000000001,-74.08273100000002,0.7],[4.729741000000002,-74.11773100000002,0.7],[4.638741000000001,-74.12473100000003,0.7],[4.589741,-74.11773100000002,0.7],[4.575741000000001,-74.131731,0.7],[4.764741000000004,-74.04073100000005,0.7],[4.729741000000002,-74.06173100000004,0.7],[4.729741000000002,-74.08973100000003,0.7],[4.554741,-74.09673100000003,0.7],[4.645741000000001,-74.10373100000001,0.7],[4.638741000000001,-74.19473099999999,0.7],[4.624741000000002,-74.11073100000002,0.7],[4.568741000000001,-74.09673100000003,0.7],[4.561741,-74.14573100000001,0.7],[4.547741,-74.08973100000003,0.7],[4.687741000000003,-74.03373100000005,0.7],[4.561741,-74.10373100000001,0.7],[4.6527410000000025,-74.11073100000002,0.7],[4.645741000000001,-74.08973100000003,0.7],[4.645741000000001,-74.173731,0.7],[4.5967410000000015,-74.138731,0.7],[4.736741000000004,-74.08273100000002,0.7],[4.708741000000003,-74.09673100000003,0.7],[4.701741000000002,-74.10373100000001,0.7],[4.603741000000001,-74.06173100000004,0.7],[4.6177410000000005,-74.18773099999999,0.7],[4.6527410000000025,-74.138731,0.7],[4.638741000000001,-74.166731,0.7],[4.694741000000002,-74.06873100000004,0.7],[4.687741000000003,-74.04773100000003,0.7],[4.687741000000003,-74.06173100000004,0.7],[4.687741000000003,-74.131731,0.7],[4.624741000000002,-74.08273100000002,0.7],[4.694741000000002,-74.04073100000005,0.7],[4.561741,-74.11773100000002,0.7],[4.631741000000002,-74.07573100000002,0.7],[4.645741000000001,-74.07573100000002,0.7],[4.631741000000002,-74.06173100000004,0.7],[4.624741000000002,-74.06873100000004,0.7],[4.610741000000001,-74.06873100000004,0.7]]
    var colors = {
                            0: '#80D3DB',
                            0.4: '#7EBFDD',
                            0.7: '#799CD9',
                            0.8: '#7A82D9',
                            0.9: '#8665D5',
                            1: '#B82EC6'
                        }
     /*var heat = L.heatLayer(arrayHeat, {
                            radius: 30,
                            gradient: colors,
                            minOpacity: 0.8
                        }).addTo(map);*/
    /*function getStyle(feature) {
        return {
            color: feature.properties.color,
            opacity: 1,
            fillColor: feature.properties.color,
            fillOpacity: 0.5,
            weight: 1,
            radius: $scope.map.point_radius,
            clickable: true
        };
    };*/

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

    $scope.seleccionarProyecto = function(key,e) {
        console.log(e.target);
        
        var otherProjects = document.getElementsByClassName('proyecto');
        _.each(otherProjects,function(p) {
            p.style.color = null;
        })
        e.target.style.color = '#5A5A5A';

        $scope.file.name = e.target.innerHTML;
        console.log(e.target.innerHTML);

        $scope.file.array = $scope.proyectos[key].points;
        addPointsNewCSV();
        $scope.showDialogs.explorar = true;
    }

    $scope.saveCSVModel = function() {
        var name = $scope.file.name + '_' + moment().format('DD/MM/YY');
        var candidatesResult = [];
        _.each($scope.response.candidatesResult,function(candidate) {
            delete candidate['vector'];
            candidatesResult.push(candidate);
        })
        var secundarySuggestions = [];
        _.each($scope.response.secundarySuggestions,function(candidate) {
            delete candidate['vector'];
            secundarySuggestions.push(candidate);
        })
        var suggestions = [];
        _.each($scope.response.suggestions,function(candidate) {
            delete candidate['vector'];
            suggestions.push(candidate);
        })
        var suggestions1 = [];
        _.each($scope.response.suggestions1,function(candidate) {
            delete candidate['vector'];
            suggestions1.push(candidate);
        })
        var suggestions2 = [];
        _.each($scope.response.suggestions2,function(candidate) {
            delete candidate['vector'];
            suggestions2.push(candidate);
        })
        var suggestions3 = [];
        _.each($scope.response.suggestions3,function(candidate) {
            delete candidate['vector'];
            suggestions3.push(candidate);
        })
        var suggestions4 = [];
        _.each($scope.response.suggestions4,function(candidate) {
            delete candidate['vector'];
            suggestions4.push(candidate);
        })

        var weights = _.map($scope.map.layers, function(layer) {
            return layer.opacity;
        });

        var contextVariables = [];
        _.each($scope.newContextVariables, function(variable) {
            console.log(variable);
            var c = { 
                color: "673AB7",
                name: variable.name,
                opacity:variable.opacity,
                selected:true,
                values:variable.values
            }
            contextVariables.push(c);
        })

        var response = {
            accuracy: $scope.response.accuracy,
            candidatesResult: candidatesResult,
            secundarySuggestions: secundarySuggestions,
            suggestions: suggestions,
            suggestions1: suggestions1,
            suggestions2: suggestions2,
            suggestions3: suggestions3,
            suggestions4: suggestions4,
            radius: $scope.file.radius

        }
        var model = {
            name: name,
            response: response
        }
        var xhr = new XMLHttpRequest;
        var url =  window.globals.API_ENDPOINT + 'add_model';
        console.log(url);
        xhr.open('POST', url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Token", getLocalStorageValue('token'));

        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (JSON.parse(xhr.response).status === "ok") {
                    window.location = window.globals.CLIENT_ENDPOINT +  'profile';
                }
                else {
                    console.log('not ok');
                }
            }
        };

        var body = {
            model: model
        }
        console.log(body);
        xhr.send(JSON.stringify(body));
    }

    $scope.downloadCSVModel = function() {
        console.log('downloadCSVModel');
        var csvRows = [];
        csvRows.push('Candidatos');
        csvRows.push('lat, lng, radio, prediccion');
        _.each($scope.response.candidatesResult,function(candidate) {
            var lat = (candidate.i1 + candidate.i2)/2;
            var lng = (candidate.j1 + candidate.j2)/2;
            var prediccion = candidate.classPredicted;
            var radio = $scope.file.radius;
            var geocoder = new google.maps.Geocoder;
            var latlng = {
                lat: lat,
                lng: lng
            }
            csvRows.push(lat + ', ' + lng + ', ' + radio + ', ' + prediccion);
        })
        var sugerencias = angular.copy($scope.response.suggestions).concat($scope.response.secundarySuggestions);
        csvRows.push('Sugerencias');
        csvRows.push('lat, lng, radio, prediccion');
        var suggestions = 
        _.each(sugerencias,function(candidate) {
            var lat = (candidate.i1 + candidate.i2)/2;
            var lng = (candidate.j1 + candidate.j2)/2;
            var prediccion = 5;
            var radio = $scope.file.radius;
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
        a.download    = $scope.file.name + '.csv';

        document.body.appendChild(a);
        a.click();
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
                }
                else {
                    console.log('not ok');
                }
            }
        };
        xhr.send();

        /*header = document.querySelector("header");
        if (!classie.has(header,"smaller")) {
            classie.add(header,"smaller");
        }*/

        $scope.changeYear();

        /*var now = moment().valueOf();
        requestData(0,now);*/
        $scope.changeLayers();

        $scope.colors = _.shuffle($scope.colors);

        $scope.proyectos = getLocalStorageValue('variables');

        //x, y, radius, startAngle, endAngle
    }

    $scope.changeYear = function() {
        $scope.dateRange.months = [];
        var width = window.innerWidth;
        var now = moment();
        if ($scope.map.year !== 'now') {
            now.year($scope.map.year).endOf("year");
        }
        var sumDays = 0;
        var widthOneHour = (width - 10)/24;
        for(var i = 1; i <= 24; i++) {
            var hour = {
                name: i + ":00",
                numerDays: widthOneHour
            };
            $scope.dateRange.months.push(hour);
        }
        
        $scope.dateRange.moveRight = 50;
        $scope.changeDateInt();
    }

    /*function showData(arrayData, colorIndex) {
        _.each($scope.map.layers[colorIndex].points, function(point) {
            map.removeLayer(point);
        });
        var arrayIndex = [];
        var radius;
        if(arrayData.length !== 0) {
            radius = parseInt(5000/arrayData.length);
        }
        _.each(arrayData, function(point) {
            var circle = L.circle([point.lat, point.lng], radius, {
                color: $scope.map.layers[colorIndex].color,//Border Color
                fillColor: $scope.map.layers[colorIndex].color,
                borderOpacity: 0.5,
                fillOpacity: 0.5
            }).addTo(map);
            arrayIndex.push(circle);
        });
        $scope.map.layers[colorIndex].points = arrayIndex;
        bringFilePointsToFront();
    }

    function bringFilePointsToFront() {
        _.each($scope.file.points, function(point) {
            point.bringToFront();
        });
    }*/

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