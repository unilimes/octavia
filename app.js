angular.module("app", [
    "ui.router",
    "ngResource"
]);


angular.module("app").config([
    "$stateProvider", "$urlRouterProvider",
    function ($stateProvider, $urlRouterProvider) {
        var url = "templates/"

        $stateProvider
            .state('home',{url: '/home', templateUrl:url+'home.html', controller: function($scope){
                $scope.setIframeSrc = function(){
                    $scope.iframeSrc =  'landing.html?time='+Date.now();

                };
                var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
                var eventer = window[eventMethod];
                var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";
                eventer(messageEvent, function (e) {
                    var key = e.message ? "message" : "data";
                    var data = e[key];
                    if(data['loadFinish']){
                        jQuery('.footer-custom').fadeOut();
                        setTimeout(function () {
                            jQuery('.right-menu').fadeOut(2000);
                        },10000);
                    }else if(data['PAUSE_CONTENT']){
                        jQuery('.footer-custom').fadeIn();
                        jQuery('.right-menu').fadeIn();
                    }else if(data['PLAY_CONTENT']){
                        jQuery('.footer-custom').fadeOut();
                        jQuery('.right-menu').fadeOut();
                    }
                });
            } })
            .state('info',{url: '/info', templateUrl:url+'info.html', controller: function($scope){ } })
            .state('help',{url: '/help', templateUrl:url+'help.html', controller: function($scope){ } });


        $urlRouterProvider.otherwise("/home")
    }
]);
