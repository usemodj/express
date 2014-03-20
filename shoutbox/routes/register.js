var User = require('../models/User');

exports.form = function(req, res){
	res.render('register', {title: 'Register'});
};

exports.submit = function(req, res, next){
	var data = req.body.user;

	if(data.name.length < 4 || data.pass.length < 4){
		res.error("Username or Password length is less than 4.");
		return res.redirect('back');
		
	}
	if(data.pass != data.pass_confirm){
		res.error("Password and Password Confirmation is different!");
		return res.redirect('back');
		
	}

	User.getByName(data.name, function(err, user){
		if(err) return next(err);

		// redis will default it
		if(user.id){
			res.error("Username already taken!");
			res.redirect('back');
		} else {
			user = new User({
				name: data.name,
				pass: data.pass
			});

			user.save(function(err){
				if(err) return next(err);
				req.session.uid = user.id;
				res.redirect('/');
			});
		}
	});
};
