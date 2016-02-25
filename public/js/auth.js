/**
* модуль авторизации используя JS API facebook
**/

var Auth = {};

/**
* инициализация, загрузка Facebook API
**/
Auth.init = function(){
	// Load the SDK asynchronously
	(function(d, s, id) {
	var js, fjs = d.getElementsByTagName(s)[0];
	if (d.getElementById(id)) return;
	js = d.createElement(s); js.id = id;
	js.src = "//connect.facebook.net/en_US/sdk.js";
	fjs.parentNode.insertBefore(js, fjs);
	}(document, 'script', 'facebook-jssdk'));
	
	window.fbAsyncInit = function() {
		FB.init({
		appId      : '1188822827831138',
		cookie     : true,  // enable cookies to allow the server to access 
							// the session
		xfbml      : true,  // parse social plugins on this page
		version    : 'v2.5' // use graph api version 2.5
		});
		FB.getLoginStatus(function(response) {
			Auth.sendFbUserdata(response, function(res){});
		});
	};
	
	console.log('Auth.init');
};


/**
* отправка на сервер данных о пользователе, полученных от Facebook для создания учетной записи  
**/
Auth.sendFbUserdata = function(response, callback){
	console.log('Auth.sendFbUserdata');
	console.log(response);
	if (response.status == 'connected'){
		var userId = response.authResponse.userID;
		var accessToken = response.authResponse.accessToken;
		var name = '';
		FB.api('/me', function(response){
			name = response.name;
			console.log(response);
			var params = "user_id="+userId+"&access_token="+accessToken+"&name="+name;
			Ajax.sendRequest('POST', '/fbuserdata', params, callback);
		});
	}
	
};


/**
* обработчик кнопки "Facebook Login", логин используя Facebook 
**/
Auth.fbUserLogin = function(callback){
	console.log('Auth.fbUserLogin');
	FB.getLoginStatus(function(response) {
      	if (response.status == 'connected'){
			var userId = response.authResponse.userID;
			var name = '';
			var accessToken = response.authResponse.accessToken;
			FB.api('/me', function(response){
				name = response.name;
				var params = "user_id="+userId+"&access_token="+accessToken+"&name="+name;
				Ajax.sendRequest('POST', '/fbuserlogin', params, function(result){
					console.log(result);
					if (result.res){
						window.location.replace('/');
					}
				});
			});
		}
    });
	
};
