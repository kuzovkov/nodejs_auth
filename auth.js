var sqlite3 = require('sqlite3');
var hash = require('./md5').calcMD5;
var db_file = 'users.sqlite'; /**файл учетных записей пользователей**/

var db = new sqlite3.Database(db_file);

/** создание таблицы если не было**/
var sql = "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, login, password, fb_id, access_token, email)";	
db.run(sql,function(err){
	if ( err != null ){
		console.log(err);
	} else{
		console.log('table users has created');
	}
});

/**
* выполнение произвольного запроса
* @param sql строка запроса
* @param callback функция обратного вызова в которую передается результат
**/
function query(sql, callback){
	db.run(sql,function(err){
		if ( err != null ){
			callback(false);
		} else{
			callback(true);
		}
	});
}

/**
* обработка запроса на вход в аккаунт
* @param login логин
* @param pass пароль
* @param req объект request
* @param callback функция обратного вызова в которую передается результат
**/
function login(login, pass, req, callback){
	checkPass(login, hash(pass), function(res){
		if (res){			
			req.session.login = login;
			req.session.pass = hash(pass);
			callback(true);
		}else{
			callback(false);
		}
	});
}

/**
* обработка запроса на выход из аккаунта
* @param req объект request
**/
function logout(req){	
	req.session.destroy(function(err){
		if (err) console.log(err);
	});
}

/**
* получение массива пользователей из базы данных
* @param callback функция обратного вызова в которую передается результат в виде массива объектов
**/
function getUsers(callback){
	var sql = "SELECT * FROM users";
	var users = [];	
	db.all(sql, function(err, rows){
		for ( var i = 0; i < rows.length; i++ ){
			users.push({login: rows[i].login, pass: rows[i].password, fb_id: rows[i].fb_id, access_token: rows[i].access_token});
		}
		callback(users);
	});	
}

/**
* добавление учетной записи пользователя в базу данных
* @param user объект пользователя вида {login:login, pass:password}
**/
function addUser(user){
	var sql = "INSERT INTO users (login, password, email) VALUES ('"+user.login+"','"+hash(user.pass)+"', '"+user.email+"')";
	db.run(sql,function(err){
		if ( err != null ){
			console.log(err);
		} else{
			console.log('user '+ user.login + ' was added');
		}
	});
}

/**
* добавление учетной записи пользователя в базу данных при получении учетных данных от Facebook
* @param name имя пользователя
* @param userId ID пользователя в Facebook
* @param accessToken предоставленный Facebook
* @param callback функция обратного вызова в которую передается результат
**/
function addFbUser(name, userId, accessToken, email, callback){
	getUsers(function(users){
		if (users.length > 0){
			for(var i = 0; i < users.length; i++){
				console.log(users[i].login+'-'+name+';'+users[i].fb_id+'-'+userId);
				if (users[i].login == name && userId == users[i].fb_id){
					var sql = "UPDATE users SET access_token ='"+accessToken+"', email = '"+ email +"' WHERE fb_id='"+userId+"' AND login='"+name+"'";
					console.log('fbuser update');
					query(sql, callback);
					return;		
				}
			}
		}
		console.log(userId);
		var sql = "INSERT INTO users (login, password, fb_id, access_token, email) VALUES ('"+name+"','"+hash(userId)+"','"+userId+"','"+accessToken+"','"+email+"')";
		query(sql, callback);
		console.log('fbuser added');
		return;
		
	});
}

/**
* обработка запроса на регистрацию нового пользователя
* @param login логин
* @param pass пароль
* @param callback функция обратного вызова в которую передается результат
**/
function register(login, pass, email, callback){
	getUsers(function(users){
		for(var i = 0; i < users.length; i++){
			if (users[i].login == login){
				callback(false);
				return;		
			}
		}	
		addUser({login:login, pass:pass, email: email});
		callback(true);
	});	
}

/**
* обработка запроса на проверку авторизации пользователя
* @param req объект request
* @param res объект response
* @param next функция вызываемая после успешной проверки
**/
function isAuth(req, res, next){
	if (req.session.login && req.session.pass){
		checkPass(req.session.login, req.session.pass, function(result){
			if (result){
				next();
			}else{
				res.redirect('/login');
			}
		});	
	}else{
		res.redirect('/login');;
	}
}

/**
* получение логина текущего пользователя
* @param req объект request
**/
function getCurrUser(req){
	return req.session.login;
}

/**
* проверка учетных данных
* @param login логин
* @param pass пароль
* @param callback функция обратного вызова в которую передается результат
**/
function checkPass(login, pass, callback){
	getUsers(function(users){
		for (var i = 0; i < users.length; i++){
			if (users[i].login == login && users[i].pass == pass){
				callback(true);
				return;			
			}
		}
		callback(false);
	});	
	
}

exports.login = login;
exports.logout = logout;
exports.getUsers = getUsers;
exports.register = register;
exports.isAuth = isAuth;
exports.getCurrUser = getCurrUser;
exports.addFbUser = addFbUser;
