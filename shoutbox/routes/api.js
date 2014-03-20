var express = require('express');
var User = require('../models/User');
var Entry = require('../models/Entry');

exports.auth = express.basicAuth(User.authenticate);

exports.user = function(req, res, next){
	User.get(req.params.id, function(err, user){
		if(err) return next(err);
		if(!user.id) return res.send(404);
		res.json(user);
	});
};

exports.entries = function(req, res, next){
	var page = req.page;
	Entry.getRange(page.from, page.to, function(err, entries){
		if(err) return next(err);
		//res.json(entries);
		
		res.format({
			/*
			'application/json': function(){
				res.send(entries);
			},
			'application/xml': function(){
				res.render('entries/xml', {entries: entries});
			}, */
			//The res.format() method also accepts an extension name that maps to an associated MIME type.
			json: function(){
				res.send(entries);
			},
			xml: function(){
				res.render('entries/xml', {entries: entries});
			}

		});
		/*
		res.format({
			json: function(){
				res.send(entries);
			},
			xml: function(){
				res.render('entries/xml', {entries: entries});
			}
		});
		*/
	});
};

