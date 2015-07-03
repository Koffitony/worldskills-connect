'use strict';

/**
 * @ngdoc service
 * @name connectApp.User
 * @description
 * # User
 * Service in the connectApp.
 */
angular.module('connectApp')
  .factory('User', function ($q, $http, API_CONNECT, auth, APP_ID, APP_ROLES) {  	
  		var User = {
            data: $q.defer(),
            connections: $q.defer(),
            requested: $q.defer(),
            subscriptions: $q.defer()
        };

  		User.init = function(){
    		// var featuredOnly = (featured) ? "?featured=" + featured : "";
            if(typeof User.data.promise == 'undefined') User.data = $q.defer();

            //wait for auth.user to resolve                    
            $q.when(auth.user.$promise).then(function(){                
                $http.get(API_CONNECT + "/user/person/" + auth.user.person_id).then(function(result){                    
                    User.data.resolve();
                    User.data = result.data;                    
                },
                function(error){
                    User.data.reject("Could not fetch user: " + error.data.user_msg);
                })
            });    		

    		return User.data.promise;
    	};                

        User.isAdmin = function(){
            var isAdmin = false;

            angular.forEach(auth.user.roles, function(val, key){
                if(val.role_application.application_code == APP_ID && val.name == APP_ROLES.ADMIN)              
                    isAdmin = true;
            });

            return isAdmin;

        };        

        User.saveProfile = function(userObj){
            var deferred = $q.defer();

            var postData = {
                'id': userObj.id,
                'profile_description': userObj.profile_description,
                'email_address': userObj.email_address,
                'phone_number': userObj.phone_number,
                'company': userObj.company,
                'job_title': userObj.job_title
            };

            $http.put(API_CONNECT + "/user/" + User.data.id, postData).then(function(result){
                deferred.resolve(result);
            },
            function(error){
                deferred.reject("Could not save user profile: " + error.data.user_msg);
            });



            //$http.put(API_CONNECT + "/user/" + User.data.id, userObj).then(function(result){                
            //    deferred.resolve(result);
            //},
            //function(error){
            //    deferred.reject("Could not save profile: " + error);
            //});
            // var postData = {
            //   "first_name": "Jonia",
            //   "last_name": "Aaltonen",
            //   "gender": "M",
            //   "country": {
            //     "id": 1,
            //     "abbreviation": "FI",
            //     "name": {
            //       "lang_code": "en",
            //       "text": "Finland"
            //     }
            //   },
            //   "email_address": "joni@joniaaltonen.info",
            //   "phone_number": "+358407005372",
            //   "company": "WorldSkills",
            //   "job_title": "Senior Web Developer",
            //   "profile_description": "This is my profile description. Lorem Ipsum and all that!"              
            // };

            return deferred.promise;
        };


    	User.setAttendance = function(event, status){
            var deferred = $q.defer();
            
            var postData = {
                "user"  : { "id" : User.data.id },
                "event" : { "id" : event },
                "status": { "id" : status}
            };

            $http.put(API_CONNECT + "/subscriptions", postData).then(function(res){
                deferred.resolve(res.data);
            },
            function(error){
                deferred.reject("Could not save subscription to event: " + error.data.user_msg);
            })

            return deferred.promise;
    	};

        User.actionConnection = function(connectionId, accepted){
            var deferred = $q.defer();
            var acceptStr = (accepted) ? "accept" : "deny";
            
            $http.put(API_CONNECT + "/connections/" + connectionId + "/" + acceptStr).then(function(res){
                deferred.resolve(res);
            },
            function(error){
                deferred.reject("Could not save connection: " + error.data.user_msg);
            });

            return deferred.promise;
        };

        User.deleteConnection = function(connectionId){
            var deferred = $q.defer();

            $http.delete(API_CONNECT + "/connections/" + connectionId).then(function(res){
                deferred.resolve(res);

                //refresh connections
                User.getConnections();
                User.getRequested();
            }, function(error){
                deferred.reject("Could not delete connection: " + error.data.user_msg);
            });

            return deferred.promise;
        }


       
        User.inbox = function(){
            var deferred = $q.defer();

            $http.get(API_CONNECT + "/connections/user/" + User.data.id + "/inbox").then(function(result){
                User.data.inbox = result.data;
                deferred.resolve(result.data);
            },
            function(error){
                deferred.reject("Could not fetch inbox: " + error.data.user_msg);
            });

            return deferred.promise;
        };

        User.getConnections = function(){       
            //User.connections = $q.defer();  
            if(typeof User.connections.promise == 'undefined') User.connections = $q.defer();   

            $http.get(API_CONNECT + "/connections/user/" + User.data.id).then(function(result){                            
                //go through connections and set ids to an array to be used later in event.js, an easy list of all connected user.ids
                var temp_connections = result.data;
                temp_connections.connected_ids = [];
                angular.forEach(temp_connections.connections, function(val, key){
                    if(val.from.id == User.data.id) temp_connections.connected_ids.push(val.to.id);
                    else if(val.to.id == User.data.id) temp_connections.connected_ids.push(val.from.id);
                });            

                User.connections.resolve(temp_connections);
                User.connections = temp_connections;

                //User.connections.resolve(result.data);
                //User.connections = result.data;
            },
            function(error){
                User.connections.reject("Could not fetch connections: " + error.data.user_msg);
            });
            
            return User.connections.promise;
        };

        User.getRequested = function(){
            if(typeof User.requested.promise == 'undefined') User.requested = $q.defer();   

            $http.get(API_CONNECT + "/connections/user/" + User.data.id + "?include_pending=1").then(function(result){                            
                //go through connections and set ids to an array to be used later in event.js, an easy list of all connected user.ids
                var temp_requests = result.data;
                temp_requests.requested_ids = [];
                angular.forEach(temp_requests.connections, function(val, key){
                    if(val.from.id == User.data.id) temp_requests.requested_ids.push(val.to.id);
                    else if(val.to.id == User.data.id) temp_requests.requested_ids.push(val.from.id);
                });            

                User.requested.resolve(temp_requests);
                User.requested = temp_requests;
            },
            function(error){
                User.requested.reject("Could not fetch connections: " + error.data.user_msg);
            });
            
            return User.connections.promise;            
        };

        User.requestContact = function(uid){
            var deferred = $q.defer();

            var postData = {
                "from": {
                    "id": User.data.id
                },
                "to": {
                    "id": uid
                },
                "accepted": false,
                "denied": false
            };

            $http.post(API_CONNECT + "/connections/", postData).then(function(result){
                deferred.resolve(result);

                //refresh connections
                User.getConnections();
                User.getRequested();
            },
            function(error){
                deferred.reject("Could not send contact request: " + error.data.user_msg);
            });

            return deferred.promise;
        };

        User.cancelRequest = function(connectionId){
            var deferred = $q.defer();

            $http.delete(API_CONNECT + "/connections/" + connectionId).then(function(result){
                deferred.resolve(result);

                //refresh connections
                User.getConnections();
                User.getRequested();
            },
            function(error){
                deferred.reject("Could not cancel request: " + error.data.user_msg);
            });

            return deferred.promise;
        };

        User.cancelRequestByUserId = function(userId){
            var deferred = $q.defer();

            //get connection id
            User.getConnectionByUserId(userId).then(function(result){
                //remove connection
                $http.delete(API_CONNECT + "/connections/" + result.id).then(function(result2){
                    deferred.resolve(result2);

                    //refresh connections
                    User.getConnections();
                    User.getRequested();
                },
                function(error){
                    deferred.reject("Could not cancel request: " + error.data.user_msg);
                });            
            },
            function(error){
                deferred.reject(error.data.user_msg);
            });

            return deferred.promise;
        };

        User.getSent = function(){
            var deferred = $q.defer();

            $http.get(API_CONNECT + "/connections/user/" + User.data.id + "/sent").then(function(result){
                User.data.sent = result.data;
                deferred.resolve(result.data);
            },
            function(error){
                deferred.reject("Could not fetch sent contact requests: " + error.data.user_msg);
            });

            return deferred.promise;
        };

        User.isConnected = function(uid){    
            return (User.connections.connected_ids.indexOf(parseInt(uid)) == -1) ? false : true;
            //var connected = false;
                        
            //angular.forEach(User.connections.connections, function(val, key){                    
            //    if(val.from.id == uid || val.to.id == uid){
            //        connected = true;
            //    }
            //});            

            //return connected;
        };

        User.isRequested = function(uid){                      
            return (User.requested.requested_ids.indexOf(parseInt(uid)) == -1) ? false : true;      
        };

        User.getConnectionByUserId = function(uid){
            //todo optimize this, no need to return full connection list
            var deferred = $q.defer();

            //if self
            if(uid == User.data.id) deferred.reject();

            $http.get(API_CONNECT + "/connections/user/" + User.data.id + "?include_pending=1").then(function(result){
                //go through results
                angular.forEach(result.data.connections, function(val, key){
                    if(val.from.id == uid || val.to.id == uid) deferred.resolve(val);
                });
                deferred.reject();
            },
            function(error){
                deferred.reject(error.data.user_msg);
            });

            return deferred.promise;
        };

         User.getSubscriptions = function(){
            if(typeof User.subscriptions.promise == 'undefined') User.subscriptions = $q.defer();   

            $http.get(API_CONNECT + "/subscriptions/users/" + User.data.id).then(function(result){

                //User.subscriptions = result.data;
                //User.data.subscriptions = Subscriptions;
                var temp_subscriptions = {};

                //cleanup, go through all subs
                angular.forEach(result.data.subscriptions, function(val, key){
                    temp_subscriptions[val.event.id] = val;     
                });                

                //User.data.subscriptions = temp_subscriptions;

                User.subscriptions.resolve(temp_subscriptions);
                User.subscriptions = temp_subscriptions;
            },
            function(error){
                User.subscriptions.reject("Could not fetch subscriptions: " + error.data.user_msg);
            });

            return User.subscriptions.promise;
        };




        //external resources  

        User.getUserSubscriptions = function(uid){
            var deferred = $q.defer();

            $http.get(API_CONNECT + "/subscriptions/users/" + uid).then(function(result){

                var temp_subscriptions = {};

                //cleanup, go through all subs
                angular.forEach(result.data.subscriptions, function(val, key){
                    temp_subscriptions[val.event.id] = val;     
                });                

                //User.data.subscriptions = temp_subscriptions;

                deferred.resolve(temp_subscriptions);                
            },
            function(error){
                deferred.reject("Could not fetch subscriptions: " + error.data.user_msg);
            });

            return deferred.promise;
        };      


        

        User.getById = function(uid){
            var deferred = $q.defer();

            $http.get(API_CONNECT + "/user/" + uid).then(function(result){
                deferred.resolve(result.data);
            },
            function(error){
                deferred.reject("Could not fetch user: " + error.data.user_msg);
            });

            return deferred.promise;
        };


  	return User;  
  });
