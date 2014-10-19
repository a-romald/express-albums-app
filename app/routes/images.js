var express = require('express');
var router = express.Router();

/* Errors */
var errors = require('../config/errors');
var image_title_error = errors.image.title;
var image_album_id_error = errors.image.album_id;
var image_file_error = errors.image.file;

/* Validator */
var isEmptyObject = require('../lib/empty');
var validator = require('validator');

/* Models */
var images = require('../models/images');

/* Image File */
var formidable = require('formidable');
var http = require('http');
var util = require('util');
var path = require('path');
var fs = require('fs');

/* Pagination */
var pagination = require('pagination');

/* Thumbnails */
var gm = require('gm').subClass({ imageMagick: true });



/* GET images listing. */
router.get('/', function(req, res) {

	images.count(function(err, result) {

		total = parseInt(result[0].count, 10);
		var currentPage = req.params.num ? req.params.num : 1;
		var perPage = 5;
		var start = (currentPage - 1) * perPage;
		
		var boostrapPaginator = new pagination.TemplatePaginator({
		    prelink:'/images', current: currentPage, rowsPerPage: perPage,
		    totalResult: total, slashSeparator: true,
		    template: function(result) {
		        var i, len, prelink;
		        var html = '<div><ul class="pagination">';
		        if(result.pageCount < 2) {
		            html += '</ul></div>';
		            return html;
		        }
		        prelink = this.preparePreLink(result.prelink);
		        if(result.previous) {
		            html += '<li><a href="' + prelink + result.previous + '">' + this.options.translator('PREVIOUS') + '</a></li>';
		        }
		        if(result.range.length) {
		            for( i = 0, len = result.range.length; i < len; i++) {
		                if(result.range[i] === result.current) {
		                    html += '<li class="active"><a href="' + prelink + result.range[i] + '">' + result.range[i] + '</a></li>';
		                } else {
		                    html += '<li><a href="' + prelink + result.range[i] + '">' + result.range[i] + '</a></li>';
		                }
		            }
		        }
		        if(result.next) {
		            html += '<li><a href="' + prelink + result.next + '" class="paginator-next">' + this.options.translator('NEXT') + '</a></li>';
		        }
		        html += '</ul></div>';
		        return html;
		    }
		});
		
		images.paging(start, perPage, function(err, images) {
	    	res.render('images/index', { title: 'Images List', images: images, paginator: boostrapPaginator.render(), messages: req.flash('info') });
	    });
	});
    
});





router.get('/page/:num?', function(req, res) {
	//fs.readFileSync(path.join(__dirname, '../..', '/app/lib/templatePaginator.js'));
	images.count(function(err, result) {

		total = parseInt(result[0].count, 10);
		var currentPage = req.params.num ? req.params.num : 1;
		var perPage = 5;
		var start = (currentPage - 1) * perPage;
		
		var boostrapPaginator = new pagination.TemplatePaginator({
		    prelink:'/images', current: currentPage, rowsPerPage: perPage,
		    totalResult: total, slashSeparator: true,
		    template: function(result) {
		        var i, len, prelink;
		        var html = '<div><ul class="pagination">';
		        if(result.pageCount < 2) {
		            html += '</ul></div>';
		            return html;
		        }
		        prelink = this.preparePreLink(result.prelink);
		        if(result.previous) {
		            html += '<li><a href="' + prelink + result.previous + '">' + this.options.translator('PREVIOUS') + '</a></li>';
		        }
		        if(result.range.length) {
		            for( i = 0, len = result.range.length; i < len; i++) {
		                if(result.range[i] === result.current) {
		                    html += '<li class="active"><a href="' + prelink + result.range[i] + '">' + result.range[i] + '</a></li>';
		                } else {
		                    html += '<li><a href="' + prelink + result.range[i] + '">' + result.range[i] + '</a></li>';
		                }
		            }
		        }
		        if(result.next) {
		            html += '<li><a href="' + prelink + result.next + '" class="paginator-next">' + this.options.translator('NEXT') + '</a></li>';
		        }
		        html += '</ul></div>';
		        return html;
		    }
		});
		
		images.paging(start, perPage, function(err, images) {
	    	res.render('images/index', { title: 'Images List', images: images, paginator: boostrapPaginator.render(), messages: req.flash('info') });
	    });
	});
    
});






//Add Image - show Add Form
router.get('/add', function(req, res) {
    
    images.items(function(err, albums) {
        res.render('images/add', { title: 'Add Image', albums: albums });
    });
    
});





//Add Image - File and POST data
router.post('/add', function(req, res) {
    
    var form = new formidable.IncomingForm();
    form.uploadDir = "./public/photos/big";       //set upload directory
    form.keepExtensions = true;     //keep file extension

    form.parse(req, function(err, fields, files) {
      	//Errors
		var errors = new Array();
		if ( validator.isLength(fields.title, 2, 100) !== true ) {
			errors.push(image_title_error);
		}
		if ( validator.equals(fields.album_id, 0) || validator.isNull(fields.album_id) ) {
			errors.push(image_album_id_error);
		}
		if ( validator.isNull(files.image.name) ) {
			errors.push(image_file_error);
		}
		if (isEmptyObject(errors)) {
			var strstr = require('../lib/strstr');
			var substr = require('../lib/substr');
			var unix = Math.round(+new Date()/1000);
		var ext = strstr(files.image.path, "."); 
    		var imageName = substr(files.image.name, 0, -4) + "-" + unix + ext;
    		var thumbName = substr(files.image.name, 0, -4) + "-" + unix + "_" + "s" + ext;

			fs.readFile(files.image.path, function (err, data) {
	       		var newPath = form.uploadDir + "/" + imageName;
				fs.writeFileSync(newPath, fs.readFileSync(files.image.path));
				/* Thumbnails */
				var bigIm = path.join(__dirname, '../..', '/public/photos/big/' + imageName);
				var smallIm = path.join(__dirname, '../..', '/public/photos/thumb/' + thumbName);
				gm(bigIm)
					.resize(120, 120)
					.noProfile()
					.write(smallIm, function (err) {
				  		if (err) console.log('Error');
					});
				fs.unlinkSync(files.image.path);

			});
			var data = {
				album_id: fields.album_id,
	            title: fields.title,
	            big: "/photos/big/" + imageName,
	            thumb: "/photos/thumb/" + thumbName
	        };
        
	        images.add(data, function() {
	        	req.flash('info', 'Image added!');
				res.redirect('/images');
			});

		}
		else {
			images.items(function(err, albums) {
		        res.render('images/add', { title: 'Add Image', albums: albums, errors: errors });
		    });
    	}
    });


});






//Edit Image - show Form
router.get('/edit/:id', function(req, res) {
    
    images.edit(req.param('id'), function(err, image) {
    	if (isEmptyObject(image)) {
    		var err = new Error('Image Not Found');
    		err.status = 404;
    		res.render('error', {
	            message: err.message,
	            error: err
	        });
    	}
    	else {
    		images.items(function(err, albums) {
		        res.render('images/edit', { title: 'Edit Image', albums: albums, image: image });
		    });
    		}
   	});

});




//Edit Image - POST data
router.post('/edit/:id', function(req, res) {
    
    if (req.body.hasOwnProperty('edit')) {
		//Errors
		var errors = new Array();
		if ( validator.isLength(req.body.title, 2, 100) !== true ) {
			errors.push(image_title_error);
		}
		if (validator.equals(req.body.album_id, 0) || validator.isNull(req.body.album_id)) {
			errors.push(image_album_id_error);
		}
		//Send POST data
		if (isEmptyObject(errors)) {
			var data = {
				id: req.body.id,
	            title: req.body.title,
	            album_id: req.body.album_id
	        };
	        
	        images.update(data, function() {
	        	req.flash('info', 'Image updated!');
	    		res.redirect('/images');
	    	});
    	}
    	else {
    		images.edit(req.param('id'), function(err, image) {
    			images.items(function(err, albums) {
			        res.render('images/edit', { title: 'Edit Image', albums: albums, image: image, errors: errors });
			    });
		    	
			});
		}
    }

});





//Delete Image
router.get('/del/:id', function(req, res) {

       images.get(req.param('id'), function(err, image) {
   			var pathFile =  './public' + image[0].big;
   			var thumbFile =  './public' + image[0].thumb;
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
   		});
       images.delete(req.param('id'), function() {
       		req.flash('info', 'Image deleted!');
    		res.redirect('/images');
       	});
});




//Show Image
router.get('/show/:id', function(req, res) {
    
    images.get(req.param('id'), function(err, image) {
    	if (isEmptyObject(image)) {
    		var err = new Error('Image Not Found');
    		err.status = 404;
    		res.render('error', {
	            message: err.message,
	            error: err
	        });
    	}
    	else {
    		res.render('images/show', { title: 'Show Image', image: image });
    	}
   	});

});




module.exports = router;
