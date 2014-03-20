module.exports = function(fn, perpage){
	perpage = perpage || 10; // Default to 10 per page

	return function(req, res, next){
		var page = Math.max(parseInt(req.param('page') || '1', 10), 1) - 1;
		fn(function(err, total){
			if(err) return next(err);

			req.page = res.locals.page = {
				number: page,
				perpage: perpage,
				from: page * perpage,
				to: page * perpage +perpage -1,
				total: total,
				count: Math.ceil(total / perpage)
			};
			next(); // Pass control to next middleware component
		});
	}
};

