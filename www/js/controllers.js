angular.module('starter.controllers', ['ngCordova'])

.controller('CrtlMedCom', ['$scope','$http','$state','$cordovaNetwork','$cordovaDialogs','$ionicLoading', function($scope,$http,$state,$cordovaNetwork,$cordovaDialogs,$ionicLoading){
  $scope.buscar = function  () {
    $ionicLoading.show({
                                content: 'Loading',
                                animation: 'fade-in',
                                showBackdrop: true,
                                maxWidth: 200,
                                showDelay: 0
                            });
      if (($cordovaNetwork.isOnline() === true)&&($scope.search.length > 0)) {
        $http.get("http://farmacias.cis.unl.edu.ec/medicamento/GetBuscarMedCom/"+$scope.search).success(function(data){
         if (data.length > 0) {
          
          $scope.medicamentos = data;
          $ionicLoading.hide();
         }else{
          $cordovaDialogs.alert('No se ah encontrado ningún medicamento con las iniciales ingresadas. Por favor vuelva a intentar', 'Aviso', 'Aceptar');
         };
      });
      }else{
          $cordovaDialogs.alert('Usted no esta conectado a internet o no ah ingresado ningún nombre de medicamento.', 'Aviso', 'Aceptar');
      };

  }

}])

.controller('CrtlMedGen', ['$scope','$http','$state','$cordovaNetwork','$cordovaDialogs', function($scope,$http,$state,$cordovaNetwork,$cordovaDialogs){
  $scope.buscar = function  () {

      if (($cordovaNetwork.isOnline() === true)&&($scope.search.length > 0)) {
        $http.get("http://farmacias.cis.unl.edu.ec/medicamento/GetBuscarMedGen/"+$scope.search).success(function(data){
         if (data.length > 0) {
          $scope.medicamentos = data;
         }else{
          $cordovaDialogs.alert('No se ah encontrado ningún medicamento con las iniciales ingresadas. Por favor vuelva a intentar', 'Aviso', 'Aceptar');
         };
      });
      }else{
          $cordovaDialogs.alert('Usted no esta conectado a internet o no ah ingresado ningún nombre de medicamento.', 'Aviso', 'Aceptar');
      };

  }

}])

.controller('CtrlDetalle', ['$scope','$http','$state', '$cordovaNetwork','$cordovaDialogs', function($scope,$http,$state,$cordovaNetwork,$cordovaDialogs){

    if ($cordovaNetwork.isOnline() === true) {
       $http.get('http://farmacias.cis.unl.edu.ec/medicamento/GetDetalleMed/'+$state.params.idmed+'/'+$state.params.idpres).success(function(data){
          $scope.datos = data[0];
          
      });
    }else{
          $cordovaDialogs.alert('Usted no esta conectado a internet.', 'Aviso', 'Aceptar');
    };

 }])

.controller('CtrlMapa', ['$scope', '$http', '$state', '$cordovaGeolocation','$cordovaDialogs','ServiceMedicamentos', function($scope, $http, $state, $cordovaGeolocation, $cordovaDialogs, ServiceMedicamentos) {
  var posOptions = {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 0
        };
    
        $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
            var lat  = position.coords.latitude;
            var long = position.coords.longitude;

            var datosfarmacia = [];
            datosfarmacia = ServiceMedicamentos.get($state.params.id);

            var myLatlng = new google.maps.LatLng(lat, long);

            var mapOptions = {
                center: myLatlng,
                zoom: 16,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };

            map = new google.maps.Map(document.getElementById("map"), mapOptions);

            $scope.map = map;

            var posfarm = new google.maps.LatLng(datosfarmacia.latitud, datosfarmacia.longitud);
            
            var marker = new google.maps.Marker({
            position: myLatlng,
            map: $scope.map,
            icon: 'img/male-2.png',

            });
            
            var markerfarmacia = new google.maps.Marker({
            position: posfarm,
            map: $scope.map,
            icon: 'img/market-farm.png',

            });
            var allfarmacias = [];
            allfarmacias = ServiceMedicamentos.getall();
            leerMarket(allfarmacias);

            var infoWindow = new google.maps.InfoWindow({
          content: datosfarmacia.nombreSucursal
            });

            infoWindow.open($scope.map, markerfarmacia);

            var mDirectionsRendererOptions = {
            map: $scope.map,
            suppressMarkers: true,
            suppressInfoWindows: true
            
            };
          var directionsService = new google.maps.DirectionsService;
          var directionsDisplay = new google.maps.DirectionsRenderer(mDirectionsRendererOptions);

          directionsDisplay.setMap($scope.map);

          directionsService.route({
            origin: myLatlng,
            destination: posfarm,
            travelMode: google.maps.TravelMode.DRIVING
          }, function(response, status) {
            if (status === google.maps.DirectionsStatus.OK) {
              directionsDisplay.setDirections(response);
            } else {
              window.alert('Directions request failed due to ' + status);
            }
          });

        }, function(err) {
            
            console.log(err);
        });

     function leerMarket(data){
           for(var i=1;i<data.length; i++){
                var posfarmacia = new google.maps.LatLng(data[i].latitud, data[i].longitud);
                
                   var marker = new google.maps.Marker({
                      position: posfarmacia,
                      map: $scope.map,
                      icon: 'img/market-farm.png',
                      title: data[i].nombreSucursal,


                    });
               var info = data[i].nombreSucursal;
               agregarinfo(marker,info);
           }
           
      
    }

    function trazarruta(directionsService,directionsDisplay,posfarm) {
      directionsService.route({
            origin: myLatlng,
            destination: posfarm,
            travelMode: google.maps.TravelMode.DRIVING
          }, function(response, status) {
            if (status === google.maps.DirectionsStatus.OK) {
              directionsDisplay.setDirections(response);
            } else {
              window.alert('Directions request failed due to ' + status);
            }
          });
    }
    
    function agregarinfo(marker, mensaje){
        var infoWindow = new google.maps.InfoWindow({
          content: mensaje
      });
 
      google.maps.event.addListener(marker, 'click', function () {
          infoWindow.open($scope.map, marker);
          trazarruta(directionsService,directionsDisplay,posfarm);
          
      });
    }
    
}])

.controller('CtrlListFarm', ['$scope', '$http', '$state', '$cordovaGeolocation','$cordovaNetwork','$cordovaDialogs','$location','$ionicLoading','ServiceMedicamentos', function($scope, $http, $state, $cordovaGeolocation, $cordovaNetwork,$cordovaDialogs,$location,$ionicLoading,ServiceMedicamentos) {
  var posOptions = {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 0
        };

        $ionicLoading.show({
                                content: 'Loading',
                                animation: 'fade-in',
                                showBackdrop: true,
                                maxWidth: 200,
                                showDelay: 0
                            });

        $scope.distancia = 10;
        $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
            var lat  = position.coords.latitude;
            var long = position.coords.longitude;

             if (($cordovaNetwork.isOnline() === true)&&(lat != 0)&&(long != 0)) {
              $http.get('http://farmacias.cis.unl.edu.ec/Farmacia/getAll/'+$state.params.idmed+'/'+lat+'/'+long+'/10').success(function(data){
                    if (data.length > 0) {
                      $scope.datos = data;
                      $ionicLoading.hide();
                      ServiceMedicamentos.setfarmacias(data);
                    }else{
                      $cordovaDialogs.alert('No se ah encontrado ninguna farmacia cercana a usted.', 'Aviso', 'Aceptar');
                      //$location.path("/app/medicamentoscomerciales");
           };
                    
            });
             }else{
              $cordovaDialogs.alert('Usted no esta conectado a internet o su GPS no esta encendido.', 'Aviso', 'Aceptar');
    
             };
        }, function(err) {
            
            console.log(err);
        });

$scope.cambiardistancia = function (distancia) {
  
  $scope.datos = ServiceMedicamentos.getxdistancia(distancia);

}
    
       
    
}])

