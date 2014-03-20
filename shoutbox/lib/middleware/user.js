var User = require('../../models/User');

module.exports = function(req, res, next){
	if(req.remoteUser) {
		res.locals.user = req.remoteUser;
	}
	var uid = req.session.uid;
	//console.log(">> uid:"+ uid);
	if(!uid) return next();
	User.get(uid, function(err, user){
		if(err) return next(err);
		//console.log(">> user:"+ JSON.stringify(user));
		req.user = res.locals.user = user;
		next();
	});
};