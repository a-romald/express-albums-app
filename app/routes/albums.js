var express = require('express');
var router = express.Router();
var fs = require('fs');

/* Errors */
var errors = require('../config/errors');
var album_title_errors = errors.album.title;
var album_description_errors = errors.album.description;

/* Validator */
var isEmptyObject = require('../lib/empty');
var validator = require('validator');

/* Models */
var albums = require('../models/albums');



/* GET albums listing. */
router.get('/', function(req, res) {
    
    albums.list(function(err, albums) {
        res.render('albums/index', { title: 'Albums List', albums: albums, messages: req.flash('info') });
    });
    
});



//Show Album
router.get('/show/:id', function(req, res) {
    
    albums.show(req.param('id'), function(err, album) {
    	if (isEmptyObject(album)) {
    		var err = new Error('Album Not Found');
    		err.status = 404;
    		res.render('error', {
	            message: err.message,
	            error: err
	        });
    	}
    	else {
    		albums.imgs(req.param('id'), function(err, images) {
    			res.render('albums/show', { title: 'Show Album', album: album, images: images });
    		});
    	}
   	});

});



//Add Album - show Add Form
router.get('/add', function(req, res) {
    
    res.render('albums/add', { title: 'Add Album' });
    
});



//Add Album - POST data
router.post('/add', function(req, res) {
    
    if (req.body.hasOwnProperty('add')) {
		//Errors
		var errors = new Array();
		if ( validator.isLength(req.body.title, 2, 100) !== true ) {
			errors.push(album_title_errors);
		}
		if ( validator.isLength(req.body.description, 3, 1000) !== true ) {
			errors.push(album_description_errors);
		}
		//Send POST data
		if (isEmptyObject(errors)) {
			var data = {
	            title: req.body.title,
	            description: req.body.description
	        };
	        
	        albums.add(data, function() {
	        	req.flash('info', 'Album added!');
				res.redirect('/albums');
			});
    	}
    	else {
    		res.render('albums/add', { title: 'Add Album', errors: errors });
		}
    }

});



//Edit Album - show Form
router.get('/edit/:id', function(req, res) {
    
    albums.edit(req.param('id'), function(err, album) {
    	if (isEmptyObject(album)) {
    		var err = new Error('Album Not Found');
    		err.status = 404;
    		res.render('error', {
	            message: err.message,
	            error: err
	        });
    	}
    	else {
    		res.render('albums/edit', { title: 'Edit Album', album: album });
    	}
   	});

});



//Edit Album - POST data
router.post('/edit/:id', function(req, res) {
    
    if (req.body.hasOwnProperty('edit')) {
		//Errors
		var errors = new Array();
		if ( validator.isLength(req.body.title, 2, 100) !== true ) {
			errors.push(album_title_errors);
		}
		if ( validator.isLength(req.body.description, 3, 1000) !== true ) {
			errors.push(album_description_errors);
		}
		//Send POST data
		if (isEmptyObject(errors)) {
			var data = {
				id: req.body.id,
	            title: req.body.title,
	            description: req.body.description
	        };
	        
	        albums.update(data, function() {
	        	req.flash('info', 'Album updated!');
	    		res.redirect('/albums');
	    	});
    	}
    	else {
    		albums.edit(req.param('id'), function(err, album) {
		    	res.render('albums/edit', { title: 'Edit Album', album: album, errors: errors });
			});
		}
    }

});



//Delete Album
router.get('/del/:id', function(req, res) {

       albums.delete(req.param('id'), function() {
       		albums.imgs(req.param('id'), function(err, images) {
       			images.forEach(function(image) {
       				var pathFile =  './public' + image.big;
		   			var thumbFile =  './public' + image.thumb;
		   			if (isEmptyObject(pathFile) || pathFile == './publicnull') {
		   				console.log('Empty ' + pathFile);
		   			} else {
		   				fs.unlinkSync(pathFile);
		   			}

		   			if (isEmptyObject(thumbFile)|| thumbFile == './publicnull') {
		   				console.log('Empty ' + thumbFile);
		   			} else {
		   				fs.unlinkSync(thumbFile);
		   			}
       			})
       		});
       		albums.clear(req.param('id'), function() {
       			req.flash('info', 'Album deleted!');
    			res.redirect('/albums');
       		});
		});
});



module.exports = router;
