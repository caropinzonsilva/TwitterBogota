app.controller("ViewProjectController", ["$scope", "$http", "$routeParams", "localStorageService", function ($scope, $http, $routeParams, localStorageService) {
    angular.extend($scope, {
        project: {
            name: '',
            description: ''
        },
        map: {
            center: {
                lat: 4.6482976,
                lng: -74.107807,
                zoom: 11
            },
            prev_layer: null,
            geoJson: {
                "type": "FeatureCollection",
                "features": []
            },
            point_radius: 5
        }
    });

    //Map
    var map = L.map('map').setView([$scope.map.center.lat, $scope.map.center.lng], $scope.map.center.zoom);
    L.tileLayer('http://korona.geog.uni-heidelberg.de/tiles/roadsg/x={x}&y={y}&z={z}', {
        maxZoom: 19,
        attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    function getStyle(feature) {
        return {
            color: feature.properties.color,
            opacity: 1,
            fillColor: feature.properties.color,
            fillOpacity: 0.5,
            weight: 1,
            radius: $scope.map.point_radius,
            clickable: true
        };
    };

    function updateMap() {
        console.log($scope.map.geoJson);

        console.log('updateMap');

        if ($scope.map.prev_layer) {
            //map.removeLayer($scope.map.prev_layer);
        }

        $scope.map.prev_layer = L.geoJson($scope.map.geoJson, {
            pointToLayer: function (feature, latlng) {
                console.log('new pointToLayer');
                console.log(feature);
                var circle = L.circleMarker(latlng, getStyle(feature));
                console.log(circle);
                return circle;
            }
        }).addTo(map);
    };

    socket = io.connect(window.globals.API_ENDPOINT);
    socket.emit('im_browser',{});
    socket.on('data_received', function(data) {
        console.log(data);
        var feature = { 
            "type": "Feature",
            "geometry": {
                "type": "Point", 
                "coordinates": [data.lng, data.lat]
            },
            "properties": {
                "color": "black",
                "time": data.time,
                "info": data.info, 
                "value": data.value
            }
        };
        $scope.map.geoJson.features.push(feature);
        updateMap();
        var marker = L.marker([data.lat, data.lng]).addTo(map);
        marker.bindPopup("<b>Information: " + data.info + "</b><br>" + "<b>Value: " + data.value + "</b>")
    });

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
        var xhr = new XMLHttpRequest;
        var url =  window.globals.API_ENDPOINT + 'project_details/' + $routeParams.project_id;
        console.log(url);
        xhr.open('GET', url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Token", getLocalStorageValue('token'));

        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (JSON.parse(xhr.response).status === "ok") {
                    var project = JSON.parse(xhr.response).project;
                    $scope.$apply(function () {
                        $scope.project.name = project.name;
                        $scope.project.description = project.description;
                    });
                }
                else {
                    console.log('not ok');
                }
            }
        };

        xhr.send();
    }

    initialize();

}]);


