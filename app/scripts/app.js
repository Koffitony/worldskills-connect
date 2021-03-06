'use strict';

/**
 * @ngdoc overview
 * @name connectApp
 * @description
 * # connectApp
 *
 * Main module of the application.
 */
angular
  .module('connectApp', [
    'ngAnimate',
    'ngAria',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ui.select',
    'ngTouch',
    'ui.router',
    'ui.bootstrap',
    'daterangepicker',
    'pascalprecht.translate',
    'worldskills.utils',
    'angularFileUpload'
  ])
  //.config(function ($routeProvider) {
    .config(function ($routeProvider, APP_ROLES, $translateProvider, $stateProvider, $urlRouterProvider, $httpProvider, $locationProvider) {
    
    $urlRouterProvider.otherwise('/');

      $urlRouterProvider.otherwise(function ($injector, $location) {
      // check for existing redirect
      var $state = $injector.get('$state');
      var redirectToState = sessionStorage.getItem('redirect_to_state');
      var redirectToParams = sessionStorage.getItem('redirect_to_params');
      sessionStorage.removeItem('redirect_to_state');
      sessionStorage.removeItem('redirect_to_params');
      if (redirectToState) {
          if (redirectToParams) {
              redirectToParams = angular.fromJson(redirectToParams);
          } else {
              redirectToParams = {};
          }
          $state.go(redirectToState, redirectToParams);
      } else {
          $state.go('home');
      }
  });

    $httpProvider.interceptors.push(['$q', 'WSAlert', '$timeout', function($q, WSAlert, $timeout) {
    return {        
      responseError: function(rejection) {
        /*
          Called when another XHR request returns with
          an error status code.          
        */
        if(
            (rejection.status == 400 && rejection.data.code == "1800-1012") ||            
            (rejection.status == 401 && rejection.data.code == "100-101")
          )
          {
          WSAlert.danger(rejection.data.user_msg + ". Redirecting to login...");
          var refreshLogin = function(){ 
            //FIXME - figure out a way to redirect to login directly without a refresh
            window.history.go(0); 
          };
          //redirect to login after 2.5 second timeout
          $timeout(refreshLogin, 500);
        }
        return $q.reject(rejection);
      }
    };
  }]);


  $translateProvider.useStaticFilesLoader({
    prefix: 'languages/',
    suffix: '.json'
  });

  $translateProvider.preferredLanguage('en_US');
  $translateProvider.fallbackLanguage('en_US');
  $translateProvider.useLocalStorage();
  $translateProvider.useSanitizeValueStrategy('sanitize');

  //language negotiation
  //http://angular-translate.github.io/docs/#/guide/09_language-negotiation
  // $translateProvider.registerAvailableLanguageKeys(['en', 'pt'], {
  //   'en_US': 'en',
  //   'en_UK': 'en',
  //   'pt_BR': 'pt'    
  // });


//routes
  var assessmentCriteriaMenu = {
    templateUrl: 'views/assessmentCriteria.menu.html',
    controller: 'AssessmentcriteriamenuCtrl'
  };

  $stateProvider

  // //index
    .state('home', {
      url: '/',
      templateUrl: 'views/main.html',
      contoller: 'HomeCtrl',
      data: {
        requireLoggedIn: false    
      }
    })

   //events
   .state('events', {
     url: '/events',
     templateUrl: 'views/events.html',
     controller: 'EventsCtrl',
     data: {
      requireLoggedIn: true,
      unAuthenticatedCallback: function(auth, $state){ $state.go('signup'); },
       requiredRoles: [
         {code: 1800, role: APP_ROLES.ADMIN},
         {code: 1800, role: APP_ROLES.MANAGER},
         {code: 1800, role: APP_ROLES.USER}
       ]
     }
   })

   .state('signup', {
    url: '/signup',
    controller: 'SignupCtrl',
    templateUrl: 'views/signup.html',
    data: {
      requireLoggedIn: false
    }
   })


   .state('terms', {
    url: '/terms',
    controller: 'TermsCtrl',
    templateUrl: 'views/terms.html',
    data: {
      requireLoggedIn: false
    }
   })

   .state('signupConfirmed', {
    url: '/signupConfirmed',
    controller: 'SignupConfirmedCtrl',
    templateUrl: 'views/signupconfirmed.html',
    data: {
      requireLoggedIn: false
    }
   })

    .state('signupExisting', {
    url: '/signupWS',
    controller: 'SignupExistingCtrl',
    templateUrl: 'views/signupexisting.html',
    data: {
      requireLoggedIn: false
    }
   })

   .state('event', {
      url: '/event/:eventId',
      templateUrl: 'views/event.html',
      controller: 'EventCtrl',
      data: {
        requireLoggedIn: true,
        unAuthenticatedCallback: function(auth, $state){ $state.go('signup'); },
        requiredRoles: [
          {code: 1800, role: APP_ROLES.ADMIN},
          {code: 1800, role: APP_ROLES.MANAGER},
          {code: 1800, role: APP_ROLES.USER}
        ]
      }
   })

   .state('user', {
    url: '/user/{userId}',
    templateUrl: 'views/user.html',
    controller: 'UserCtrl',
    abstract: true,
    data: {
      requireLoggedIn: true,
        requiredRoles: [
          {code: 1800, role: APP_ROLES.ADMIN},
          {code: 1800, role: APP_ROLES.MANAGER},
          {code: 1800, role: APP_ROLES.USER}
        ]
      }
   })

   .state('user.profile', {
    url: '',
    templateUrl: 'views/userprofile.html',
    controller: 'UserProfileCtrl',
    data: {
      requireLoggedIn: true,
      requiredRoles: [
          {code: 1800, role: APP_ROLES.ADMIN},
          {code: 1800, role: APP_ROLES.MANAGER},
          {code: 1800, role: APP_ROLES.USER}
        ]
        
      }
   })

  .state('user.matchmaking', {
    url: '/matchmaking',
    templateUrl: 'views/usermatchmaking.html',
    controller: 'UserMatchMakingCtrl',
    data: {
      requireLoggedIn: true,
      requiredRoles: [
          {code: 1800, role: APP_ROLES.ADMIN},
          {code: 1800, role: APP_ROLES.MANAGER},
          {code: 1800, role: APP_ROLES.USER}
        ]        
      }
   })

  .state('user.image', {
    url: '/image',
    templateUrl: 'views/user.image.cropper.html',
    controller: 'UserImageCropperCtrl',
    data: {
        requireLoggedIn: true,
        requiredRoles: [
          {code: 1800, role: APP_ROLES.ADMIN},
          {code: 1800, role: APP_ROLES.MANAGER},
          {code: 1800, role: APP_ROLES.USER}
        ]
    }
   })

   .state('user.edit', {
    url: '/edit',
    templateUrl: 'views/userprofileedit.html',
    controller: 'UserProfileCtrl',
    data: {
      requireLoggedIn: true,
        requiredRoles: [
          {code: 1800, role: APP_ROLES.ADMIN},
          {code: 1800, role: APP_ROLES.MANAGER},
          {code: 1800, role: APP_ROLES.USER}
        ]
      }
   })

   .state('user.inbox', {
    url: '/inbox',
    templateUrl: 'views/userinbox.html',
    controller: 'UserInboxCtrl',
    data: {
      requireLoggedIn: true,
        requiredRoles: [
          {code: 1800, role: APP_ROLES.ADMIN},
          {code: 1800, role: APP_ROLES.MANAGER},
          {code: 1800, role: APP_ROLES.USER}
        ]
      }
   })

   .state('user.sent', {
    url: '/sent',
    templateUrl: 'views/usersent.html',
    controller: 'UserSentCtrl',
    data: {
      requireLoggedIn: true,
      requiredRoles: [
          {code: 1800, role: APP_ROLES.ADMIN},
          {code: 1800, role: APP_ROLES.MANAGER},
          {code: 1800, role: APP_ROLES.USER}
        ]
      }
   })

   .state('user.connections', {
    url: '/connections',
    controller: 'UserConnectionsCtrl',
    templateUrl: 'views/userconnections.html',
    data: {
      requireLoggedIn: true,
      requiredRoles: [
          {code: 1800, role: APP_ROLES.ADMIN},
          {code: 1800, role: APP_ROLES.MANAGER},
          {code: 1800, role: APP_ROLES.USER}
        ]
      }
   })

  .state('user.events', {
    url: '/events',
    controller: 'UserEventsCtrl',
    templateUrl: 'views/userevents.html',
    data: {
      requireLoggedIn: true,
      requiredRoles: [
          {code: 1800, role: APP_ROLES.ADMIN},
          {code: 1800, role: APP_ROLES.MANAGER},
          {code: 1800, role: APP_ROLES.USER}
        ]
      }
   })

    .state('user.password', {
    url: '/password',
    controller: 'UserPasswordCtrl',
    templateUrl: 'views/userpassword.html',
    data: {
      requireLoggedIn: true,
      requiredRoles: [
          {code: 1800, role: APP_ROLES.ADMIN},
          {code: 1800, role: APP_ROLES.MANAGER},
          {code: 1800, role: APP_ROLES.USER}
        ]
      }
   })

    //admin

  .state('admin', {
    url: '/admin',
    abstract: true,
    templateUrl: 'views/admin.html',
    controller: 'AdminCtrl',
    data:{
        requireLoggedIn: true,        
        forbiddenCallback: function(auth, $state){
          //state passed from $rootScope.$state
          alert("You do not have access to this view");
          $state.go('home');
        },
        requiredRoles: [
          {code: 1800, role: APP_ROLES.ADMIN},
          {code: 1800, role: APP_ROLES.MANAGER},
        ]
      }
  })

  //below admin views inherit the required roles as they are children of the 'admin' state
  .state('admin.overview', {
    url: '/overview',
    templateUrl: 'views/admin.overview.html',
    controller: 'AdminOverviewCtrl'
  })

  .state('admin.export', {
    url: '/export',
    templateUrl: 'views/admin.export.html',
    controller: 'AdminExportCtrl'
  })

  .state('admin.exportParticipants', {
    url: '/exportParticipants',
    templateUrl: 'views/admin.exportparticipants.html',
    controller: 'AdminExportParticipantsCtrl'
  })

   ;

  })
.run(function($rootScope, $state, $stateParams, auth, WSAlert){
  //DEVELOPMENT API URL
  $rootScope.api_url = "http://localhost:8080/connect/";
  $rootScope.available_languages = {"en_US":"English", "pt_BR":"Portuguese (Brazil)"};

  //PRODUCTION API URL
  //$rootScope.api_url = "http://beuk.worldskills.org/glossary/";
  $rootScope.closeAlert = WSAlert.closeAlert;

  // It's very handy to add references to $state and $stateParams to the $rootScope
  // so that you can access them from any scope within your applications.For example,
  // <li ng-class='{ active: $state.includes('contacts.list') }'> will set the <li>
  // to active whenever 'contacts.list' or one of its decendents is active.
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;
});