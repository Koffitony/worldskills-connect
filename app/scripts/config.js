(function() {
    'use strict';

    //TODO update values when integrating with API
    
    var connectApp = angular.module('connectApp'); 
    connectApp.constant('API_CONNECT', 'https://staging-api.worldskills.org/connect');
    connectApp.constant('APP_ID', '1800');
    connectApp.constant('API_IMAGES', 'https://staging-api.worldskills.org/images');
    connectApp.constant('CLIENT_ID', '');
    connectApp.constant('API_AUTH', 'https://staging-api.worldskills.org/auth/');
    connectApp.constant('AUTHORIZE_URL', 'ttps://staging-auth.worldskills.org/oauth/authorize');
    connectApp.constant('LOGOUT_URL', 'http://auth.diaz.worldskills.org/logout');

    connectApp.constant('DATE_FORMAT', 'yyyy-MM-ddThh:mm:ssZ');
    connectApp.constant('WORLDSKILLS_CLIENT_ID', '');
    connectApp.constant('WORLDSKILLS_API_AUTH', 'https://staging-api.worldskills.org/auth');
    connectApp.constant('WORLDSKILLS_AUTHORIZE_URL', 'https://staging-auth.worldskills.org/oauth/authorize');

    connectApp.constant('APP_ROLES', {
        ADMIN: 'Admin',
        MANAGER: 'Manager',
        USER: 'User'        
    });

})();