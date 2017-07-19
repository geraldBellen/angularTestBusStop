/**
 * Created by geraldBellen on 7/19/2017.
 */
"use strinct";
var app = angular.module('busStopApp', ['ngResource', 'ngMap']);

app.service('busService', function ($http, $q) {
    return {
        // return an object {busStaopData: API Object, centerCoordinate: Object}
        getBusesStop: function () {
            var getStops;
            var getDeparture;
            var center;
            var defered = $q.defer();
            navigator.geolocation.getCurrentPosition(function(position) {
                var latitude = position.coords.latitude;
                var longitude = position.coords.longitude;

                defered.resolve([latitude, longitude]);
            });

            return defered.promise.then(function (coordinates) {
                var busStopPromise = $http.get('http://transportapi.com/v3/uk/bus/stops/bbox.json?minlon='+ coordinates[1] +'&minlat='+ coordinates[0] +'&maxlon='+ coordinates[1] +'&maxlat='+ coordinates[0] +'&api_key=6c790cc8b20f0b394dedf8ba0ff8353c&app_id=915f5f01');
                return $q.all({busStopData: busStopPromise, centerCoordinate: {latitude: coordinates[0], longitude: coordinates[1]}});

                // static data hardcode
                /*var busStopPromise = $http.get('http://transportapi.com/v3/uk/bus/stops/bbox.json?minlon=-0.0938&minlat=51.5207&maxlon=-0.074&maxlat=51.528&api_key=6c790cc8b20f0b394dedf8ba0ff8353c&app_id=915f5f01');
                return $q.all({busStopData: busStopPromise, centerCoordinate: {latitude: 51.5207, longitude: -0.0938}});*/
            });
        },
        // return API Object
        getBusesDeparture: function (autoCode) {
            return  $http.get('http://transportapi.com/v3/uk/bus/stop/' + autoCode + '/live.json?group=route&api_key=6c790cc8b20f0b394dedf8ba0ff8353c&app_id=915f5f01');
        }
    }
});

app.controller('busController', function($scope, busService) {
    busService.getBusesStop()
        .then(function (busesData) {
            $scope.positions = {
                center: busesData.centerCoordinate,
                busStops: busesData.busStopData.data.stops
            };
            $scope.busesDepartures = {};

            // initialize map
            $scope.$on('mapInitialized', function(event, map) {
                $scope.map = map;
            });

            // handle on click event
            $scope.markerInfo = function(event, busInfo){
                $scope.isLoading = true;
                busService.getBusesDeparture(busInfo.atcocode)
                    .then(function (busesDepartureData) {
                        $scope.isLoading = false;
                        $scope.busesDepartures = busesDepartureData.data.departures;
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
            };
        });
});
