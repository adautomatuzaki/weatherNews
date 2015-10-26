// Ionic Starter App

// Database instance.
var db = null;

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var climaApp = angular.module('climaApp', ['ionic','ngCordova']);

climaApp.run(function($ionicPlatform, $cordovaSQLite) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
      
    db = $cordovaSQLite.openDB({name: "my.db"});
    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS clima (id INTEGER PRIMARY KEY, name text, lat text, lon text, description text, temp text, temp_min text, temp_max text, humidity text, pressure text)");
    
  });
})

climaApp.controller("climaCtrl", ["$scope","$ionicLoading", "$cordovaSQLite","climaSvc", climaCtrl]);

function climaCtrl($scope, $ionicLoading, $cordovaSQLite, climaSvc){
    $scope.cidade = "";
    $scope.temperatura = "";
    
    climaSvc.loadClima();
    
    $scope.$on("climaApp.temperatura", function(_,result){
        $scope.cidade = result.name;
        
        $scope.latitude = result.coord.lat;
        $scope.longitude = result.coord.lon;
        
        $scope.descricao = result.weather[0].description;
        
        $scope.temperatura = result.main.temp;
        
        $scope.temp_min = result.main.temp_min;
        $scope.temp_max = result.main.temp_max;
        $scope.umidade = result.main.humidity;
        $scope.pressao = result.main.pressure;
        
        $scope.temp_icon = "http://openweathermap.org/img/w/" + result.weather[0].icon + ".png";
        
        query = "insert into clima (name, lat, lon, description, temp, temp_min, temp_max, humidity, pressure ) values (?,?,?,?,?,?,?,?,?)";
        $cordovaSQLite.execute(db,query,[$scope.cidade,$scope.latitude,$scope.longitude,$scope.descricao,$scope.temperatura,$scope.temp_min, $scope.temp_max, $scope.umidade,$scope.pressao]).then(function(result) {
            console.log("Insert ID -> " + result.insertId);
        }, function(error){
            console.log("error");
        });

    }
    );
        
    $scope.$on("climaApp.temperaturaerror", function(_,result){
            console.log("call climaApp.temperaturaerror")
            var query = "select name, lat, lon, description, temp, temp_min, temp_max, humidity, pressure from clima order by id desc";
            $cordovaSQLite.execute(db,query,[]).then(function(result) {
                if(result.rows.length > 0){
                    $scope.cidade = result.rows.item(0).name;

                    $scope.latitude = result.rows.item(0).lat;
                    $scope.longitude = result.rows.item(0).lon;

                    $scope.descricao = result.rows.item(0).description;

                    $scope.temperatura = result.rows.item(0).temp;

                    $scope.temp_min = result.rows.item(0).temp_min;
                    $scope.temp_max = result.rows.item(0).temp_max;
                    $scope.umidade = result.rows.item(0).humidity;
                    $scope.pressao = result.rows.item(0).pressure;

                    console.log("Registro Encontrado ");
                } else{
                    console.log("Registro não Encontrado ");
                }
            }, function(error){
                console.log("error");
            });
        }
    );
    
    $scope.reloadClima = function() {
        console.log("Reload Clima");
        climaSvc.loadClima();
        $scope.$broadcast("scroll.infiniteScrollComplete");
        $scope.$broadcast("scroll.refreshComplete");
    }
}

climaApp.service("climaSvc", ["$http", "$rootScope", climaSvc]);

function climaSvc($http, $rootScope){
    this.loadClima = function(){
        console.log("Carregando clima");
        url = "http://api.openweathermap.org/data/2.5/weather?lat=-21.6692&lon=-49.6933&units=metric&lang=pt&appid=bd82977b86bf27fb59a04b61b657fb6f";
        $http.get(url, {params : ""}).success(
            function (result) {
                console.log("Temperatura carregada com Sucesso");
                $rootScope.$broadcast("climaApp.temperatura", result);
            }
        ).error(
            function (result) {
                console.log("Erro ao carregar temperatura");
                $rootScope.$broadcast("climaApp.temperaturaerror", result);
            }
        );
    }
}