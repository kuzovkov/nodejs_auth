var Auth = {};

Auth.sendFbUserdata = function(response, callback){
	if (response.status == 'connected'){
		var userId = response.authResponse.userId;
		var accessToken = response.authResponse.accessToken;
		var name = '';
		FB.api('/me', function(response){
			name = response.name;
			var params = "user_id="+userId+"&access_token="+accessToken+"&name="+name;
			Ajax.sendRequest('POST', '/fbuserdata', params, callback);
		});
	}
	
};

Auth.fbUserLogin = function(callback){
	FB.getLoginStatus(function(response) {
      	if (response.status == 'connected'){
			var userId = response.authResponse.userId;
			var name = '';
			FB.api('/me', function(response){
				name = response.name;
				var params = "user_id="+userId+"&access_token="+accessToken+"&name="+name;
				Ajax.sendRequest('POST', '/fbuserlogin', params, callback);
			});
		}
    });
	
};
