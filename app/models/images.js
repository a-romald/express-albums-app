var mysql = require('mysql');
var settings = require('../config/database');


var connection = mysql.createConnection(settings);

connection.connect();

var Images = {

	list: function(callback) {
		connection.query('SELECT images.id AS id, images.album_id AS album_id, albums.title AS album_title, images.title AS title, images.big AS big, images.thumb AS thumb FROM images INNER JOIN albums ON images.album_id = albums.id ORDER BY id ASC', callback);
	},


	paging: function(start, limit, callback) {
		connection.query('SELECT images.id AS id, images.album_id AS album_id, albums.title AS album_title, images.title AS title, images.big AS big, images.thumb AS thumb FROM images INNER JOIN albums ON images.album_id = albums.id ORDER BY id ASC LIMIT ?, ?', [start, limit], callback);
	},


	count: function(callback) {
		connection.query('SELECT COUNT(id) AS count FROM images', callback);
	},


	items: function(callback) {
		connection.query('SELECT id, title FROM albums', callback);
	},


	add: function(data, callback) {

		var now = new Date();
		connection.query('INSERT INTO images SET ?, ?, ?, ?, ?', [{album_id: data.album_id}, {title: data.title}, {big: data.big}, {thumb: data.thumb}, {created: now}], callback);
		
	},
    

	edit: function(id, callback) {
        connection.query('SELECT * FROM images WHERE ? LIMIT 1', {id: id}, callback);
    },
	

    update: function(data, callback) {
        connection.query('UPDATE images SET ?, ? WHERE ?', [{title: data.title}, {album_id: data.album_id}, {id: data.id}], callback);
    
    },
    

	delete: function(id, callback) {
		connection.query('DELETE FROM images WHERE ? LIMIT 1', {id: id}, callback);
	},


	get: function(id, callback) {
        connection.query('SELECT big, thumb FROM images WHERE ? LIMIT 1', {id: id}, callback);
    }


};


module.exports = Images;