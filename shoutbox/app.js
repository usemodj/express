
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
//var user = require('./routes/user');
var user = require('./lib/middleware/user');
var http = require('http');
var path = require('path');

var register = require('./routes/register');
var messages = require('./lib/messages');
var login = require('./routes/login');
var entries = require('./routes/entries');
var api = require('./routes/api');
var validate = require('./lib/middleware/validate');
var page = require('./lib/middleware/page');
var Entry = require('./models/Entry');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', api.auth);
app.use(user);
// you should mount this messages middleware below the session middleware
// because it depends on req.session being defined.
//  Note that because this middleware was designed not to accept options
// and doesn't return a second function, you can call app.use(messages)
// instead of app.use(messages()).
app.use(messages);
app.use(app.router);
app.use(routes.notfound); //test: $ curl http://user:password@127.0.0.1:3000/api/not/a/real/path -i -H "Accept: application/json"
app.use(routes.error);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

if(process.env.ERROR_ROUTE){
	// $ ERROR_ROUTE=1 node app.js
	// and visit /dev/error in the browser
	app.get('/dev/error', function(req, res, next){
		var err = new Error('database connection failed');
		err.type  = 'database';
		next(err);
	});
}

//app.get('/', routes.index);
//app.get('/', page(Entry.count, 5), entries.list);
//app.get('/users', user.list);
app.get('/post', entries.form);
app.post('/post', 
			validate.required('entry[title]'),
			validate.lengthAbove('entry[title]', 4),
			entries.submit);

app.get('/register', register.form);
app.post('/register', register.submit);

app.get('/login', login.form);
app.post('/login', login.submit);
app.get('/logout', login.logout);

// Public REST API
app.get('/api/user/:id', api.user); // test: $ curl http://user:password@127.0.0.1:3000/api/user/1 -v
app.post('/api/entry', entries.submit); //test: $ curl -d entry[title]='Ho ho ho' -d entry[body]='Santa loves you' http://user:password@127.0.0.1:3000/api/entry -v
app.get('/api/entries/:page?', page(Entry.count, 5), api.entries); //test: $ curl http://user:password@127.0.0.1:3000/api/entries -v
																	//test: $ curl -i -H "Accept: application/xml" http://user:password@127.0.0.1:3000/api/entries -v
// Pagination
app.get('/:page?', page(Entry.count, 5), entries.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
