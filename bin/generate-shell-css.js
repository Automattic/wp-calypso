var http = require( 'http' );
var critical = require( 'critical' );

// Load the HTML page from the dev server. This will fail if the dev server is
// not running.
http.get( {
	host: 'calypso.localhost',
	port: 3000,
	path: '/'
}, function(res) {
	res.on( 'data', function( body ) {
		// Generate the CSS required to render the initial loading screen.
		critical.generate( {
			base: './',
			html: body,
			css: [ 'public/style.css' ],
			width: 1300,
			height: 900,
			dest: 'public/css/shell.css',
			minify: true,
			extract: false,
			ignore: [ /environment/ ]
		} );
	} );
});
