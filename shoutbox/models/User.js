var redis = require('redis');
var bcrypt = require('bcrypt-nodejs');
var db = redis.createClient();

module.exports = User;

function User(obj){
	for(var key in obj){
		this[key] = obj[key];
	}
}

User.prototype.save = function(fn){
	if(this.id){
		this.update(fn);
	} else {
		var user = this;
		db.incr('user:ids', function(err, id){
			if(err) return fn(err);
			user.id = id;
			user.hashPassword(function(err){
				if(err) return fn(err);
				user.update(fn);
			});
		});
	}
};

User.prototype.update = function(fn){
	var user = this;
	var id = user.id;
	db.set('user:id:' + user.name, id, function(err){
		if(err) return fn(err);
		db.hmset('user:' + id, user, function(err){
			fn(err);
		});
	});
};

User.prototype.hashPassword = function(fn){
	var user = this;
	bcrypt.genSalt(12, function(err, salt){
		if(err) return fn(err);
		user.salt = salt;
		bcrypt.hash(user.pass, salt, null, function(err, hash){
			if(err) return fn(err);
			user.pass = hash;
			fn();
		});
	});
};

User.prototype.toJSON = function(){
	return {
		id: this.id,
		name: this.name
	}
}
/*
 * Testing the user model 
 * 1. Start the ``redis-server`` on the command line.
 * 2. Run ``node models/User`` on the command line to create the example user.
 * 3. Run ``redis-cli`` on the command line
 *  <pre>
 *   $ redis-cli 
 *   redis 127.0.0.1:6379> get user:ids
 *   "1"
 *   redis 127.0.0.1:6379> hgetall user:1
 *    1) "name"
 *    2) "Tobi"
 *    3) "pass"
 *    4) "$2a$12$T5VNnNgxS1WG9kw96kAaY.pN.XV3RTvJMpmsJcHwyElDHbcv/GWqe"
 *    5) "age"
 *    6) "2"
 *    7) "id"
 *    8) "1"
 *    9) "salt"
 *   10) "$2a$12$T5VNnNgxS1WG9kw96kAaY."
 *  </pre>
 */
/*
var tobi = new User({
	name: 'Tobi',
	pass: 'im a ferret',
	age: '2'
});

tobi.save(function(err){
	if(err) throw err;
	console.log('user id %d', tobi.id);
	console.log('user pass %s', tobi.pass);
});
*/

// Fetching a user from redis
User.getByName = function(name, fn){
	User.getId(name, function(err, id){
		if(err) return fn(err);
		User.get(id, fn);
	});
};

User.getId = function(name, fn){
	db.get('user:id:'+ name, fn);
};

User.get = function(id, fn){
	db.hgetall('user:'+ id, function(err, user){
		if(err) return fn(err);
		fn(null, new User(user));
	});
};

// Authenticating a user's name and password 
User.authenticate =function(name, pass, fn){
	User.getByName(name, function(err, user){
		if(err) return fn(err);
		//When looking up a key that doesn't exist, Redis will give you
		//an empty hash, which is why the check for '!user.id' is used instead of '!user'
		if(!user.id) return fn(); // User doesn't exist
		bcrypt.hash(pass, user.salt, null, function(err, hash){
			if(err) return fn(err);
			if(hash == user.pass) return fn(null, user); // Match found
			fn(); // Invalid password
		});
	});
};

