A lightweight Express.js Applications that allows to create albums and upload
photos into them. Application implement main CRUD functions both for albums
and images. Application uses MySQL database to store paths for photos.
The sql-file appended. Pagination module requires compilation on server side.
Application also uses ImageMagick to generate thumbnails with gm module. So You
should install it into your system.

Requires Node.js installed.

Features

    Descriptive demonstration of Express.js and its modules features.
    Easy way to store photos in albums.
    
Installation

	Install Node.js and Npm

	Go to working directory and install modules with
	npm install

	Create database. Database configuration
	is in app/config/database.js file

	Create appropriate tables. Sql file with tables appended.

	To start the application
	npm start

	Open in browser page in port 8081
	127.0.0.1:8081

	If you want to change port or other configurations change it in
	bin/www file