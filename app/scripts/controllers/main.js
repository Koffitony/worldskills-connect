'use strict';

angular.module('connectApp')
  .controller('MainCtrl', function ($q, $scope, Auth, $state, $rootScope, $translate, Language, User, Events, Statuses, auth, WSAlert, Resources) {
    $scope.selectedLanguage = Language.selectedLanguage;    
        

    $scope.events = Events;
    $scope.statuses = Statuses;
    $scope.loading = {};    
    
    
    
    $scope.reloadUser = function(){

        //loading scope variables that can be used throughout the app
        $scope.user = User;        
        $scope.resources = Resources;

    
        $q.when(User.init()).then(function(){
    
            //load other resource
            var promises = [];
            promises.push(User.inbox());
            promises.push(User.getSubscriptions());
            promises.push(User.getConnections());
            promises.push(User.getRequested());
            promises.push(Resources.init());
    
            $q.all(promises).then(function(result){
                //console.log('loaded external resources');
                //User.data.subscriptions = result[1];
                //User.data.connections = result[2];
                //User.data.requested = result[3]; 
            },
            function(error){
                WSAlert.danger("Error loading user resources, please refresh your browser: " + error);
            });
            //event subscriptions
            //User.subscriptions($scope.user.data.id).then(function(res){
            //  //console.log('subscriptions loaded');
            //},
            //function(error){
            //  WSAlert.danger("", error);
            //});
    
            //load inbox        
            //loaded in chain because it gets saved within the user var
            //User.getInbox().then(function(result){
            //    $scope.user.inbox = result;
            //},
            //function(error){
            //    //fail silently
            //});
        },
        function(error){
            //WSAlert.danger("", error);
        });

    };     

    $scope.reloadUser();

    
    //load events
    $scope.loading.events_init = true;
    Events.init().then(function(result){
    	//console.log("events init");   
        $scope.loading.events_init = false; 	
    },
    function(error){
    	//WSAlert.danger("", error);
        $scope.loading.events_init = false;
    });

     //load events
    Statuses.init().then(function(result){
        //console.log("statuses init");       
    },
    function(error){
        WSAlert.danger("", "Could not fetch resources, please refresh or try again later.");
    });

    $scope.getProfileImage = function(image, type){
        var retval = false;
        if(typeof image == 'undefined' || typeof image.thumbnail == 'undefined') return false;
        type = (typeof type == 'undefined') ? "" : "_"+type; 
        retval = image.thumbnail + type;
        return retval;
    };

    $scope.getImage = function(image){
        var retval = false;

        if(typeof image == 'undefined' || typeof image.thumbnail == 'undefined') return false;
        retval = image.thumbnail;
        return retval;
    };


  })
.directive("featured", function(){
  return {
    restrict: 'E',    
    replace: true,
    templateUrl: 'views/directive.events-sidebar.html'    
  }
});
