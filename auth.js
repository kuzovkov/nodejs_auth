var sqlite3 = require('sqlite3');
var hash = require('./md5').calcMD5;
var db_file = 'users.sqlite';

var db = new sqlite3.Database(db_file);

/** создание таблицы если не было**/
var sql = "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, login, password, fb_id, access_token)";	
db.run(sql,function(err){
	if ( err != null ){
		console.log(err);
	} else{
		console.log('table users has created');
	}
});


function query(sql, callback){
	db.run(sql,function(err){
		if ( err != null ){
			callback(false);
		} else{
			callback(true);
		}
	});
}


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


function logout(req){	
	req.session.destroy(function(err){
		if (err) console.log(err);
	});
}

function getUsers(callback){
	var sql = "SELECT * FROM users";
	var users = [];	
	db.all(sql, function(err, rows){
		for ( var i = 0; i < rows.length; i++ ){
			users.push({login: rows[i].login, pass: rows[i].password});
		}
		callback(users);
	});	
}

function addUser(user){
	var sql = "INSERT INTO users (login, password) VALUES ('"+user.login+"','"+hash(user.pass)+"')";
	db.run(sql,function(err){
		if ( err != null ){
			console.log(err);
		} else{
			console.log('user '+ user.login + ' was added');
		}
	});
}

function addFbUser(name, userId, accessToken, callback){
	getUsers(function(users){
		for(var i = 0; i < users.length; i++){
			if (users[i].login == name && userId == users[i].fb_id){
				var sql = "UPDATE users SET access_token ='"+accessToken+"' WHERE fb_id='"+userId+"' AND login='"+name+"'";
				query(sql, callback);
				return;		
			}else{
				var sql = "INSERT INTO users (login, password, fb_id, access_token) VALUES ('"+name+"','"+hash(userId)+"','"+userId+"','"+accessToken+"');
				query(sql, callback);
				return;
			}
		}
	});
}


function register(login, pass, callback){
	getUsers(function(users){
		for(var i = 0; i < users.length; i++){
			if (users[i].login == login){
				callback(false);
				return;		
			}
		}	
		addUser({login:login, pass:pass});
		callback(true);
	});	
}


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


function getCurrUser(req){
	return req.session.login;
}


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
