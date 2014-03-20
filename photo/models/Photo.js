var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/photo_app');
var Schema = mongoose.Schema;
var photoSchema = new Schema({
	name: String,
	path: String,
	date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Photo', photoSchema);