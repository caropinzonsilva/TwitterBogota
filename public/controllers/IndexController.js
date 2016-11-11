app.controller("IndexController", [ "$scope", "$http", "localStorageService", function($scope, $http, localStorageService) {
    angular.extend($scope, {
        header: {
            loggedIn: false,
            showLoginForm: false,
            showSignUpForm: false,
            logInButtonClass: '',
            signUpButtonClass: ''
        },
        user: {
            email: '',
            token: ''
        },
        logInForm: {
            email: '',
            password: ''
        },
        signUpForm: {
            email: '',
            password1: '',
            password2: ''
        }
    });
    $scope.showLogIn = function() {
        $scope.header.showLoginForm = true;
        $scope.header.showSignUpForm = false;
        $scope.header.logInButtonClass = 'selected';
        $scope.header.signUpButtonClass = '';
    };

    $scope.showSignUp = function() {
        $scope.header.showLoginForm = false;
        $scope.header.showSignUpForm = true;
        $scope.header.logInButtonClass = '';
        $scope.header.signUpButtonClass = 'selected';
    };

    $scope.hideForms = function() {
        $scope.header.showLoginForm = false;
        $scope.header.showSignUpForm = false;
        $scope.header.logInButtonClass = '';
        $scope.header.signUpButtonClass = '';
    };

    $scope.logIn = function() {
        /*$scope.header.loggedIn = true;
        $scope.user.email = 'caropinzon2010@gmail.com';
        setLocalStorageValue('token', '1231231');
        setLocalStorageValue('email', $scope.user.email);*/
        var body = {
            "email": $scope.logInForm.email,
            "password": $scope.logInForm.password
        };
        console.log(body);
        var xhr = new XMLHttpRequest;
        var url =  window.globals.API_ENDPOINT + 'login';
        console.log(url);
        xhr.open('POST', url, true);
        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (JSON.parse(xhr.response).status === "ok") {
                    console.log('ok');
                    $scope.$apply(function() {
                        $scope.header.loggedIn = true;
                        $scope.user.email = body.email;
                        setLocalStorageValue('token', JSON.parse(xhr.response).token);
                        console.log(JSON.parse(xhr.response).token);
                        setLocalStorageValue('email', $scope.user.email);
                        setLocalStorageValue('variables', JSON.parse(xhr.response).variables);
                        console.log(JSON.parse(xhr.response).variables)
                    })
                    //window.location = window.globals.CLIENT_ENDPOINT + 'profile';
                }
                else {
                    console.log('not ok');
                }
            }
        };

        xhr.send(JSON.stringify(body));

    };

    $scope.signUp = function() {

        var body = {
            "email": $scope.signUpForm.email,
            "password1": $scope.signUpForm.password1,
            "password2": $scope.signUpForm.password2
        };
        console.log(body);
        var xhr = new XMLHttpRequest;
        var url =  window.globals.API_ENDPOINT + 'sign_up';
        console.log(url);
        xhr.open('POST', url, true);
        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (JSON.parse(xhr.response).status === "ok") {
                    console.log('ok');
                    $scope.header.loggedIn = true;
                    $scope.user.email = body.email;
                    setLocalStorageValue('token', JSON.parse(xhr.response).token);
                    console.log(JSON.parse(xhr.response).token);
                    setLocalStorageValue('email', $scope.user.email);
                    //window.location = window.globals.CLIENT_ENDPOINT + 'profile';
                }
                else {
                    console.log('not ok');
                }
            }
        };

        xhr.send(JSON.stringify(body));
    };

    $scope.logOut = function() {
        $scope.header.loggedIn = false;
        $scope.hideForms();
        clearAll();
        //window.location = window.globals.CLIENT_ENDPOINT;
    };

    $scope.viewMap = function () {
        window.location = window.globals.CLIENT_ENDPOINT + 'map';
    }

    $scope.goToProfile = function() {
        window.location = window.globals.CLIENT_ENDPOINT + 'profile';
    };

    $scope.goToIndex = function() {
        /*if (classie.has($scope.header,"smaller")) {
            classie.remove($scope.header,"smaller");
        }*/
        window.location = window.globals.CLIENT_ENDPOINT;
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

    function initialize() {
        var token = getLocalStorageValue('token');
        if (token) {
            $scope.header.loggedIn = true;
            $scope.user.token = token;
            $scope.user.email = getLocalStorageValue('email');
        }
        else {
            $scope.header.loggedIn = false;
        }
    };

    setTimeout(initialize(), 100);

    function init() {
        
        window.addEventListener('scroll', function(e){

            var distanceY = window.pageYOffset || document.documentElement.scrollTop,
                shrinkOn = 300,
                changeColor = window.innerHeight,
                header = document.querySelector("header");
                console.log(distanceY);
            if (distanceY > shrinkOn) {
                classie.add(header,"smaller");
            }
            else {
                if (classie.has(header,"smaller")) {
                    classie.remove(header,"smaller");
                }
            }
            if (distanceY > changeColor) {
                classie.add(header,"backgroundColor");
            }
            else {
                if (classie.has(header,"backgroundColor")) {
                    classie.remove(header,"backgroundColor");
                }
            }
        });
    }
    window.onload = init();
}]);