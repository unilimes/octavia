angular.module("app", [
    "ui.router",
    "ngResource"
]);

var app = angular.module("app");


app.config([ "$stateProvider", "$urlRouterProvider", "$locationProvider", function ($stateProvider, $urlRouterProvider, $locationProvider) {
        
        var url = "templates/";

        $stateProvider.state('home',{
                url: '/home',
                templateUrl:url+'home.html',
                controller: function($scope){
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
                            jQuery('.footer-menu-right').fadeOut(2000);
                        },10000);
                    }else if(data['PAUSE_CONTENT']){
                        jQuery('.footer-custom').fadeIn();
                        jQuery('.footer-menu-right').fadeIn();
                    }else if(data['PLAY_CONTENT']){
                        jQuery('.footer-custom').fadeOut();
                        jQuery('.footer-menu-right').fadeOut();
                    }
                });
            } 
            });
        
            $stateProvider.state('info',{
                url: '/info',
                templateUrl:url+'info.html',
                controller: function($scope){ }
            });
        
            $stateProvider.state('help',{
                url: '/help',
                templateUrl:url+'help.html',
                controller: function($scope){ }
            });

        $urlRouterProvider.otherwise("/home");
        $locationProvider.html5Mode(true);
    }
]);

app.controller('footerController', ["$scope", "$rootScope", "$http", "$state", "$timeout", function($scope, $rootScope, $http, $state, $timeout) {
    $scope.$watch(function(){
        return $state.$current.name
    }, function(newVal, oldVal){
        footer.currentName = newVal;
    });

    var footer = this;
    footer.routeName = $state;
    footer.opened = false;


    $http.get('json-data/footer.json').then(function (data){
        footer.footer_data = data.data;
    },function (error){
        console.log('No data find');
    });


    footer.open = function (force) {
        //alert("footer.open = function (force = " + force + ") {");
        if (force === undefined) {
            footer.opened = !footer.opened;
            return;
        }
        footer.opened = force;
    };

    footer.change = function (obj) {
        if (obj.event) {
            var target = obj.event.target;
            if (target.tagName === "A" ||
                target.tagName === "SPAN" ||
                (target.tagName === "IMG"  && target.parentElement.tagName === "A") ||
                (target.tagName === "DIV" && target.className === "open-button")) {
                $timeout(function () {
                    obj.event.target.click();
                }, 0);
            }
        } else {
            footer.open(obj.$state);
        }
    };

    //$scope.foo = {};
    //$scope.foo.footer = false;
    //
    //$scope.$watch("foo.footer", function () {
    //    footer.open($scope.foo.footer);
    //});

    $rootScope.$on('$stateChangeStart',
        function(){
            footer.open(false);
            //$scope.$watch("foo.footer", function () {
            //    alert("$watch('foo.footer'   in $stateChangeStart");
            //    footer.open($scope.foo.footer);
            //});
        });
}]);

