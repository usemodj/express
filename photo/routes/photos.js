
var Photo = require('../models/Photo');
var path = require('path');
var fs = require('fs');
var querystring = require('querystring');
var join = path.join;

exports.list = function(req, res, next) {
	Photo.find({}, function(err, photos){
		if(err) return next(err);
	    res.render('photos', {
	        title: 'Photos',
	        photos: photos
	    });

	});
};

exports.form = function(req, res){
	res.render('photos/upload', {
		title: 'Photo upload'
	});
};

exports.submit = function(dir){
	return function(req, res, next){
		var img = req.files.photo.image;
		var name = req.body.photo.name || img.name;
		var path = join(dir, img.name);
		console.log('>>dir: '+ dir);
		console.log('>>img.name: '+ img.name);

		fs.rename(img.path, path, function(err){
			console.log('>>rename....');
			console.log('>>img.path: '+ img.path);
			console.log('>>path: '+ path);

			if(err) return next(err);

			console.log('>>File uploaded to: ' + path + ' - ' + req.files.photo.image.size + ' bytes');
			fs.stat(path, function (err, stats) {
				if (err) return next(err);
				console.log('stats: ' + JSON.stringify(stats));
			});

			console.log('>>photo create...');
			Photo.create({
				name: name,
				path: img.name
			}, function(err){
				if(err) return next(err);
				res.redirect('/');
			});
		});
	};
};

exports.download = function(dir){
	return function(req, res, next){
		var id = req.params.id;
		Photo.findById(id, function(err, photo){
			if(err) return next(err);
			var path = join(dir, photo.path);
			console.log('>>path: '+ path);
			//res.download(path, querystring.escape(photo.name + photo.path.substring(photo.path.lastIndexOf('.'))));
			res.download(path, querystring.escape(photo.path));
		});
	};
};

exports.sendfile = function(dir){
	return function(req, res, next){
		var id = req.params.id;
		Photo.findById(id, function(err, photo){
			if(err) return next(err);
			var path = join(dir, photo.path);
			res.sendfile(path);
		});
	};
};

