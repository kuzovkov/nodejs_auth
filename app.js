var express = require('express');
var cons = require('consolidate');
var app = express();
var mysql = require('mysql');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var auth = require('./auth');


app.engine('html', cons.swig);
app.set('view engine', 'html');
app.set('views',__dirname+'/views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(express.cookieParser());
app.use(express.session({ secret: 'keyboard cat' }));

app.use('/users', auth.isAuth);
app.use('/keys', auth.isAuth);
app.use('/products', auth.isAuth);


app.get('/',function(req,res){
	res.render('index',{data:{title:'Home page', text: 'Content page', user:req.session.login}});
});

app.get('/authreq',function(req,res){
    res.render('index',{data:{title:'Auth required', text: 'Auth required'}});
});


app.get('/login',function(req,res){
    res.render('login',{data:{title:'Login page', text: 'Please authenticate!'}});
});

app.post('/login', function(req,res){
	var login = req.body.username;
	var pass = req.body.password;
	auth.login(login, pass, req, function(result){	
		if (result) {
			res.redirect('/');
		}else{
			res.redirect('/login');
		}
		
	});
});


app.get('/logout', function(req,res){	
	auth.logout(req);	
	res.redirect('/');
});

app.get('/register', function(req,res){
	res.render('register');
});

app.post('/register', function(req,res){
	var login = req.body.username;
	var pass = req.body.password;
	var email = req.body.email;
	auth.register(login, pass, email, function(result){
		if (result){
			res.render('index',{data:{title:'User '+login+' was added', text: 'User '+login+' was added'}});
		}else{
			res.render('index',{data:{title:'User '+login+' already exists', text: 'User '+login+' already exists'}});
		}		
		
	});
});

app.post('/fbuserdata', function(req,res){
	var name = req.body.name;
	var accessToken = req.body.access_token;
	var userId = req.body.user_id;
	var email = req.body.email;
	console.log(name+':'+userId+':'+accessToken+':'+email);
	auth.addFbUser(name, userId, accessToken, email, function(result){
		res.json({res:result});
	});
});

app.post('/fbuserlogin', function(req,res){
	var name = req.body.name;
	var userId = req.body.user_id;
	var email = req.body.email;
	console.log(name+':'+userId+':'+email);
	auth.login(name, userId, req, function(result){
		res.json({res:result});
	});
});
	   


app.get('/table/:name',function(req,res){
    var connection = mysql.createConnection({host:'localhost',user:'root',password:'rootroot'});
    connection.connect();
    connection.query('use botemulator');
    
	var name = req.params.name;
    sql = 'select * from '+name;
    
	connection.query(sql,function(err,result,fld){
		if (err) {
			console.error('There was an error mysql query!', err);
			res.render('index', {data:{title: 'mysql error', text: 'Mysql error: '+err.message}});
			return;
		}
		//console.log(JSON.stringify(result));
		console.log(JSON.stringify(fld))
		res.render('view_table',{title:fld[0]['table'],models:result,fld:fld});
	});

    connection.end();
});


app.get('/users', function(req,res){
    var connection = mysql.createConnection({host:'localhost',user:'root',password:'rootroot'});
    connection.connect();
    connection.query('use botemulator');
    sql = 'select * from users';

	connection.query(sql,function(err,result,fld){
		if (err) throw err;
		//console.log(JSON.stringify(result));
		console.log(JSON.stringify(fld))
		res.render('view_table',{title:fld[0]['table'],models:result,fld:fld});
	});
    connection.end();
});

app.get('/keys', function(req,res){
    var connection = mysql.createConnection({host:'localhost',user:'root',password:'rootroot'});
    connection.connect();
    connection.query('use botemulator');
    sql = 'select * from keylist';

	connection.query(sql,function(err,result,fld){
		if (err) throw err;
		//console.log(JSON.stringify(result));
		console.log(JSON.stringify(fld))
		res.render('view_table',{title:fld[0]['table'],models:result,fld:fld});
	});
    connection.end();
});

app.get('/products',  function(req,res){
    var connection = mysql.createConnection({host:'localhost',user:'root',password:'rootroot'});
    connection.connect();
    connection.query('use botemulator');
    sql = 'select * from products';

	connection.query(sql,function(err,result,fld){
		if (err) throw err;
		//console.log(JSON.stringify(result));
		console.log(JSON.stringify(fld))
		res.render('view_table',{title:fld[0]['table'],models:result,fld:fld});
	});
    connection.end();
});

app.listen(8000,function(){
    console.log('Server start');
});
