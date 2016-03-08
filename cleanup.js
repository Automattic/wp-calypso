var fs = require( 'fs' );
var glob = require( 'glob' ).glob;

var cleanup = [
	'public/style*.css',
	'public/style-debug.css.map',
	'public/*.js',
	'client/config/index.js',
	'server/devdocs/search-index.js',
	'public/editor.css',
	'build/*',
	'server/bundler/*.json'
];

cleanup.forEach( function( pattern ) {
	glob( pattern, function( er, files ) {
		files.forEach( function( file ) {
			fs.unlinkSync( file );
		} );
	} );
} );
