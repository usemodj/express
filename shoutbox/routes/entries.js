var Entry = require('../models/Entry');

exports.list = function(req, res, next){
	var page = req.page;

	Entry.getRange(page.from, page.to, function(err, entries){
		if(err) return next(err);

		res.render('entries', {
			title: 'Entries',
			entries: entries
		});
	});
};

exports.form = function(req, res){
	res.render('post', {title: 'Post'});
};

exports.submit = function(req, res, next){
	var data = req.body.entry;
	/*
	if(!data.title){
		res.err('Title is required.');
		res.redirect('back');
		return;
	}
	if(data.title.length < 4){
		res.error('Title must be longer than 4 characters.');
		res.redirect('back');
		return;
	}
	*/
	var entry = new Entry({
		'username': res.locals.user.name,
		'title': data.title,
		'body': data.body
	});

	entry.save(function(err){
		if(err) return next(err);
		if(req.remoteUser){
			res.json({message: 'Entry added.'});
		} else {
			res.redirect('/');
		}
		
	});
};

