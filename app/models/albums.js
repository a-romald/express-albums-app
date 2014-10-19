var mysql = require('mysql');
var settings = require('../config/database');


var connection = mysql.createConnection(settings);

connection.connect();

var Albums = {

	list: function(callback) {
		connection.query('SELECT * FROM albums', callback);
	},


	show: function(id, callback) {
        connection.query("SELECT id, title, description, DATE_FORMAT(created,'%d.%m.%Y') as date FROM albums WHERE ? LIMIT 1", {id: id}, callback);
    },


	add: function(data, callback) {

		var now = new Date();
		connection.query('INSERT INTO albums SET ?, ?, ?', [{title: data.title}, {description: data.description}, {created: now}], callback);
		
	},
    

	edit: function(id, callback) {
        connection.query('SELECT * FROM albums WHERE ? LIMIT 1', {id: id}, callback);
    },
	

    update: function(data, callback) {
        connection.query('UPDATE albums SET ?, ? WHERE ?', [{title: data.title}, {description: data.description}, {id: data.id}], callback);
    
    },
    

	delete: function(id, callback) {
		connection.query('DELETE FROM albums WHERE ? LIMIT 1', {id: id}, callback);
	},


	imgs: function(id, callback) {
		connection.query('SELECT id, big, thumb, title FROM images WHERE ?', {album_id: id}, callback);
    },


	clear: function(id, callback) {
		connection.query('DELETE FROM images WHERE ?', {album_id: id}, callback);
	},


};


module.exports = Albums;