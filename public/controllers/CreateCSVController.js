app.controller("CreateCSVController", ["$scope", "$http", "$routeParams", "localStorageService", function($scope, $http, $routeParams, localStorageService) {
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
            }
        },
        registers: [],
        calendario: {
            meses: ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"],
            dias: ["LUN","MAR","MIE","JUE","VIE","SAB","DOM"],
            moment: moment(),
            momentBegin: null,
            momentEnd: null,
            celdas: [],
            mes: '',
            ano: '',
            selectingBeginning: true,
            position: {
                top: 0,
                left: 0
            },
            show: false,
            selectedRange: null,
            previous: null
        },
        period: '7_d',
        name: 'nombre de variable',
        addRegisterMode: true

    });

    $scope.changeModeToEdit = function() {
        $scope.addRegisterMode = false;
    }

    $scope.changeModeToAdd = function() {
        $scope.addRegisterMode = true;
    }

    $scope.addMonth = function() {
        $scope.calendario.moment = $scope.calendario.moment.add(1, 'month').startOf('day');
        refrescarInfoMes();
    }

    $scope.subtractMonth = function() {
        $scope.calendario.moment = $scope.calendario.moment.add(-1, 'month').startOf('day');
        refrescarInfoMes();
    }

    function refrescarInfoMes() {
        var m = $scope.calendario.moment.month();
        var hoy = $scope.calendario.moment.month(m).startOf('day');;//Month (0-11), date(1,31)
        $scope.calendario.mes = $scope.calendario.meses[hoy.month()];
        $scope.calendario.ano = hoy.year();
        var primerDiaMes = $scope.calendario.moment.month(m).date(1).day();
        primerDiaMes --;
        if (primerDiaMes == -1) {
            primerDiaMes = 6;
        }
        //console.log(primerDiaMes);
        //0 = Lunes, 6 = Domingo
        var numeroDiasMes = $scope.calendario.moment.month(m).endOf('month').date();
        //console.log(numeroDiasMes);
        var numeroSemanas = Math.ceil((primerDiaMes + numeroDiasMes)/7);
        var celdasMes = [];
        for (var i = 0; i < numeroSemanas; i++) {
            var celdasSemana = [];
            for (var j = 0; j < 7; j++) {
                var claseDiaActual = "normal";
                var dia = i*7 + 1 + j - primerDiaMes;
                var now = moment().startOf('day');;
                var currentDay = angular.copy($scope.calendario.moment).date(dia).startOf('day');;
                //console.log(now,currentDay,currentDay.diff(now, 'days'));
                if(currentDay.diff(now, 'days') == 0) {
                    claseDiaActual = "today";
                }
                if($scope.calendario.momentBegin !== null && currentDay.diff($scope.calendario.momentBegin, 'days') == 0) {
                    claseDiaActual = "beginning";
                    if($scope.calendario.momentEnd !== null && currentDay.diff($scope.calendario.momentEnd, 'days') == 0) {
                        claseDiaActual = "beginningEnding";
                    }
                }
                else if($scope.calendario.momentEnd !== null && dia == $scope.calendario.momentEnd.date() && hoy.month() == $scope.calendario.momentEnd.month() && hoy.year() == $scope.calendario.momentEnd.year()) {
                    claseDiaActual = "ending";
                }
                else if($scope.calendario.momentBegin !== null && $scope.calendario.momentEnd !== null && currentDay.isBetween($scope.calendario.momentBegin, $scope.calendario.momentEnd)) {
                    claseDiaActual = "middle";
                }
                else {
                    claseDiaActual = "";
                }
                if (dia <= 0 || dia > numeroDiasMes) {
                    claseDiaActual = "fuera-mes";
                    dia = "";
                }
                if (j === 0) {
                    claseDiaActual = claseDiaActual + " celda-left";
                }
                if (i === 0) {
                    claseDiaActual = claseDiaActual + " celda-top";
                }
                celdasSemana.push({
                    clase: claseDiaActual,
                    numero: dia,
                    eventos: []
                });
            }
            celdasMes.push(celdasSemana);
        }
        $scope.calendario.celdas = celdasMes;
    }

    $scope.selectDay = function(e) {
        var date = parseInt(e.srcElement.innerHTML);
        var month = $scope.calendario.moment.month();
        var year = $scope.calendario.moment.year();
        if($scope.calendario.selectingBeginning) {
            console.log('selecting beginning');
            $scope.calendario.momentBegin = moment().month(month).year(year).date(date).startOf('day');
            //TODO remove
            //$scope.calendario.selectingBeginning = false;
        }
        else {
            console.log('selecting end');
            //$scope.calendario.selectingBeginning = true;
            $scope.calendario.momentEnd = moment().month(month).year(year).date(date).startOf('day');
        }
        if($scope.calendario.momentBegin.diff($scope.calendario.momentEnd, 'days') > 0) {
            console.log('change');
            $scope.calendario.momentEnd = $scope.calendario.momentBegin;
        }
        if($scope.calendario.momentBegin !== null) {
            $scope.calendario.selectedRange.momentBegin = $scope.calendario.momentBegin;
            $scope.calendario.selectedRange.momentBeginLabel = $scope.calendario.momentBegin.format('DD/MM/YY');
        }
        if($scope.calendario.momentEnd !== null) {
            $scope.calendario.selectedRange.momentEnd = $scope.calendario.momentEnd;
            $scope.calendario.selectedRange.momentEndLabel = $scope.calendario.momentEnd.format('DD/MM/YY');
        }
        refrescarInfoMes();
        $scope.calendario.show = false;
    }

    $scope.updateBegin = function(element) {
        //console.log(element.range);
        var dateBegin = moment(element.range.momentBeginLabel,'DD/MM/YY');
        console.log(dateBegin._d);
        if(dateBegin._d !== 'Invalid Date') {
            element.range.momentBegin = moment(element.range.momentBeginLabel,'DD/MM/YY');
        }
    }

    $scope.updateEnd = function(element) {
        //console.log(element.range);
        var dateEnd = moment(element.range.momentEndLabel,'DD/MM/YY');
        console.log(dateBegin._d);
        if(dateEnd._d !== 'Invalid Date') {
            element.range.momentEnd = moment(element.range.momentEndLabel,'DD/MM/YY');
        }
    }

    $scope.hideCalendar = function() {
        $scope.calendario.show = false;
    }

    $scope.setBeginning = function(e,element) {
        if($scope.calendario.previous !== null) {
            if($scope.calendario.previous !== element.range) {
                console.log('change');
                console.log(element.range.momentBegin);
                $scope.calendario.momentBegin = element.range.momentBegin;
                $scope.calendario.momentEnd = element.range.momentEnd;
                refrescarInfoMes();
            }
        }
        $scope.calendario.previous = element.range;
        $scope.calendario.show = true;
        $scope.calendario.selectingBeginning = true;
        $scope.calendario.position = {
            top: e.clientY,
            left: e.clientX
        }
        console.log(e,element.range);
        $scope.calendario.selectedRange = element.range;
    }

    $scope.setEnding = function(e,element) {
        $scope.calendario.show = true;
        $scope.calendario.selectingBeginning = false;
        $scope.calendario.position = {
            top: e.clientY,
            left: e.clientX
        }
        $scope.calendario.selectedRange = element.range;
    }

    $scope.fillScore = function(index,keyRange,element,keyRegister) {
        for(var i = 0; i < 5; i++) {
            console.log('score_empty_' + i + '_' + keyRange + '_' + keyRegister);
            var fullScore = document.getElementById('score_fill_' + i + '_' + keyRange + '_' + keyRegister);
            var emptyScore = document.getElementById('score_empty_' + i + '_' + keyRange + '_' + keyRegister);
            if(index >= i) {
                fullScore.style.display = 'block';
                emptyScore.style.display = 'none';
            }
            else {
                fullScore.style.display = null;
                emptyScore.style.display = null;
            }
        }
        element.range.score = index + 1;
    }

    $scope.emptyScore = function(index, keyRange,element,keyRegister) {
        for(var i = 0; i < 5; i++) {
            var fullScore = document.getElementById('score_fill_' + i + '_' + keyRange + '_' + keyRegister);
            var emptyScore = document.getElementById('score_empty_' + i + '_' + keyRange + '_' + keyRegister);
            if(index < i) {
                fullScore.style.display = null;
                emptyScore.style.display = null;
            }
            else {
                fullScore.style.display = 'block';
                emptyScore.style.display = 'none';
            }
        }
        element.range.score = index + 1;
    }

    $scope.addRange = function(element) {
        console.log(element);
        element.register.ranges.push({
            momentBegin: moment(),
            momentEnd: moment(),
            momentBeginLabel: 'dd/mm/yy',
            momentEndLabel: 'dd/mm/yy',
            score: 5
        });
    }

    $scope.deleteRegister = function(index) {
        var circle = $scope.registers[index].circle;
        map.removeLayer(circle);
        $scope.registers.splice(index, 1);
    }

    $scope.deleteRange = function(indexRegisters,indexRange) {
        $scope.registers[indexRegisters].ranges.splice(indexRange, 1);
    }

    $scope.changeRaduis = function(index) {
        var circle = $scope.registers[index].circle;
        map.removeLayer(circle);
        $scope.registers[index].circle = L.circle([circle._latlng.lat, circle._latlng.lng], $scope.registers[index].radius, {
            color: 'black',//Border Color
            fillColor: 'black',
            borderOpacity: 1,
            fillOpacity: 0.5
        }).addTo(map);
        $scope.registers[index].circle.on('click', function(eventClickCircle) {
            if(!$scope.addRegisterMode) {
                var that = this;
                var register = _.filter($scope.registers, function(register) {
                    register.show = false;
                    return register.circle == that;
                })[0];
                map.setView(new L.LatLng(register.circle._latlng.lat, register.circle._latlng.lng), 14);
                $scope.$apply(function () {
                    register.position = {
                        left: window.innerWidth/2 - 203,
                        bottom: window.innerHeight/2
                    }
                    register.show = true;
                });  
            }
        });
    }

    $scope.showRegisterDetails = function(index) {
        console.log('showRegisterDetails');
        console.log($scope.registers[index]);
        _.each($scope.registers, function(register) {
            register.show = false;
        });
        map.setView(new L.LatLng($scope.registers[index].circle._latlng.lat, $scope.registers[index].circle._latlng.lng), 14);
        $scope.registers[index].position = {
            left: window.innerWidth/2 - 203,
            bottom: window.innerHeight/2
        }
        $scope.registers[index].show = true;
    }

    $scope.hideRegisterDetails = function(index) {
        $scope.registers[index].show = false;
    }

    var map = L.map('map').setView([$scope.map.center.lat, $scope.map.center.lng], $scope.map.center.zoom);
    L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
        zoomControl: false,
        //attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">JS</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    new L.Control.Zoom({ position: 'bottomright' }).addTo(map);
    L.control.scale({ 
        position: 'bottomleft',
        imperial: false
    }).addTo(map);

    map.on('click', function(eventNewCircle) {
        if($scope.addRegisterMode) {

            var geocoder = new google.maps.Geocoder;
            var latlng = {
                lat: eventNewCircle.latlng.lat,
                lng: eventNewCircle.latlng.lng
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
                    var circle = L.circle([latlng.lat, latlng.lng], 700, {
                        color: 'black',//Border Color
                        fillColor: 'black',
                        borderOpacity: 1,
                        fillOpacity: 0.5
                    }).addTo(map);
                    $scope.$apply(function () {
                        var index = $scope.registers.length;
                        $scope.registers.push({
                            radius: 700, 
                            name: name,
                            circle: circle,
                            show: false,
                            position: {
                                left: eventNewCircle.originalEvent.clientX - 203,
                                bottom: window.innerHeight - eventNewCircle.originalEvent.clientY
                            },
                            ranges: [{
                                momentBegin: moment().startOf('day'),
                                momentEnd: moment().startOf('day'),
                                momentBeginLabel: 'dd/mm/yy',
                                momentEndLabel: 'dd/mm/yy',
                                score: 5
                            }]
                        });
                    });
                    circle.on('click', function(eventClickCircle) {
                        if(!$scope.addRegisterMode) {
                            var that = this;
                            var register = _.filter($scope.registers, function(register) {
                                register.show = false;
                                return register.circle == that;
                            })[0];
                            map.setView(new L.LatLng(register.circle._latlng.lat, register.circle._latlng.lng), 14);
                            $scope.$apply(function () {
                                register.position = {
                                    left: window.innerWidth/2 - 203,
                                    bottom: window.innerHeight/2
                                }
                                register.show = true;
                            });
                        }
                    });
                }
                else {
                  console.log('Geocoder failed due to: ' + status);
                }
            });
        }

    });

    map.on('dragstart', function() {
        console.log('dragstart');
        _.each($scope.registers,function(register) {
            //$scope.$apply(function () {
                register.show = false;
            //});
        })
    })

    map.on('zoomstart',function() {
        console.log('zoomstart');
        _.each($scope.registers,function(register) {
            //$scope.$apply(function () {
                register.show = false;
            //});
        })
    })

    $scope.downloadCSV = function() {
        var csvRows = [];
        csvRows.push('fechaI, fechaF, lat, lng, valor, radio');
        _.each($scope.registers,function(register) {
            //console.log(register);
            _.each(register.ranges, function(range) {
                var toAdd = parseInt($scope.period.split('_')[0]);
                var letterToAdd = $scope.period.split('_')[1];
                var begin = angular.copy(range.momentBegin);
                var end = angular.copy(range.momentBegin).add(toAdd,letterToAdd);
                while(begin.diff(range.momentEnd,'days') < 0) {
                    csvRows.push(begin.valueOf() + ', ' + end.valueOf() + ', ' + register.circle._latlng.lat + ', ' + register.circle._latlng.lng + ', ' + range.score + ', ' + register.radius)
                    begin = end;
                    end = angular.copy(begin).add(toAdd,letterToAdd);
                }
                
            })
        })

        var csvString = csvRows.join("\n");
        var a         = document.createElement('a');
        a.href        = 'data:attachment/csv,' +  encodeURIComponent(csvString);
        a.target      = '_blank';
        a.download    = $scope.name + '.csv';

        document.body.appendChild(a);
        a.click();
    }

    $scope.saveCSV = function() {
        var variable = {
            name: $scope.name,
            points: []
        }
        _.each($scope.registers,function(register) {
            //console.log(register);
            _.each(register.ranges, function(range) {
                var toAdd = parseInt($scope.period.split('_')[0]);
                var letterToAdd = $scope.period.split('_')[1];
                var begin = angular.copy(range.momentBegin);
                var end = angular.copy(range.momentBegin).add(toAdd,letterToAdd);
                if(end.diff(range.momentEnd,'days') > 0) {
                    end = range.momentEnd;
                }
                while(begin.diff(range.momentEnd,'days') < 0) {
                    var point = {
                        point: {
                            type : "Point",
                            coordinates: [
                                register.circle._latlng.lat,
                                register.circle._latlng.lng
                            ]
                        },
                        timeB: begin.valueOf(),
                        timeE: end.valueOf(),
                        radius: register.radius,
                        valor: range.score,
                        name: register.name
                    }
                    variable.points.push(point);
                    begin = end;
                    end = angular.copy(begin).add(toAdd,letterToAdd);
                    if(end.diff(range.momentEnd,'days') > 0) {
                        end = range.momentEnd;
                    }
                }
                
            })
        })

        var xhr = new XMLHttpRequest;
        var url =  window.globals.API_ENDPOINT + 'add_variable';
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
            variable: variable
        }
        console.log(body);
        xhr.send(JSON.stringify(body));

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

    function init() {
        refrescarInfoMes();
        var variables = getLocalStorageValue('variables');
        var index = parseInt($routeParams.variable_index);
        var variable;
        if(index != -1) {
            variable = variables[index];
        }
        else {
            variable = getLocalStorageValue('importedVariableCSV');
        }
        if(variable !== undefined && variable !== null) {
            $scope.name = variable.name;
            console.log(variable);
            //console.log(variables[index]);
            //console.log($scope.registers);
            var registers = [];
            _.each(variable.points, function(point) {
                var register = _.filter($scope.registers,function(register){
                    return point.point.coordinates[0] == register.circle._latlng.lat && point.point.coordinates[1] == register.circle._latlng.lng;
                })
                if(register.length > 0) {
                    register = register[0];
                }
                else {
                    var circle = L.circle([point.point.coordinates[0], point.point.coordinates[1]], point.radius, {
                        color: 'black',//Border Color
                        fillColor: 'black',
                        borderOpacity: 1,
                        fillOpacity: 0.5
                    }).addTo(map);
                    circle.on('click', function(eventClickCircle) {
                        if(!$scope.addRegisterMode) {
                            var that = this;
                            var register = _.filter($scope.registers, function(register) {
                                register.show = false;
                                return register.circle == that;
                            })[0];
                            map.setView(new L.LatLng(register.circle._latlng.lat, register.circle._latlng.lng), 14);
                            $scope.$apply(function () {
                                register.position = {
                                    left: window.innerWidth/2 - 203,
                                    bottom: window.innerHeight/2
                                }
                                register.show = true;
                            });
                        }
                    });
                    register = {
                        radius: point.radius, 
                        name: point.name,
                        circle: circle,
                        show: false,
                        position: {
                            left: 0,
                            bottom: 0
                        },
                        ranges: []
                    }
                    $scope.registers.push(register);
                }
                if(register.ranges.length > 0) {
                    console.log(register.ranges[register.ranges.length - 1].momentEnd.valueOf(),point.timeB);
                    if(register.ranges[register.ranges.length - 1].momentEnd.valueOf() == point.timeB && point.valor == register.ranges[register.ranges.length - 1].score) {
                        console.log('range exists');
                        register.ranges[register.ranges.length - 1].momentEnd = moment(point.timeE);
                        register.ranges[register.ranges.length - 1].momentEndLabel = moment(point.timeE).format('DD/MM/YY');
                    }
                }
                else {
                    var range = {
                        momentBegin: moment(point.timeB),
                        momentEnd: moment(point.timeE),
                        momentBeginLabel: moment(point.timeB).format('DD/MM/YY'),
                        momentEndLabel: moment(point.timeE).format('DD/MM/YY'),
                        score: point.valor
                    }
                    register.ranges.push(range);
                    /*setTimeout(function() {
                        $scope.fillScore(point.valor,0,this,0);
                    },0);*/
                }
            })
        }
        /*
        {
            radius: 700, 
            name: name,
            circle: circle,
            show: false,
            position: {
                left: eventNewCircle.originalEvent.clientX - 203,
                bottom: window.innerHeight - eventNewCircle.originalEvent.clientY
            },
            ranges: [{
                momentBegin: moment().startOf('day'),
                momentEnd: moment().startOf('day'),
                momentBeginLabel: 'dd/mm/yy',
                momentEndLabel: 'dd/mm/yy',
                score: 5
            }]
        }
        */
    }

    init();
}]);