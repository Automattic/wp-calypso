var http = require( 'http' );
var critical = require( 'critical' );
var jade = require( 'jade' );

// Stub vars and render shell HTML.
var renderVars = {
	head: {
		metas: [],
		links: []
	},
	renderedLayout: false,
	hasSecondary: true,
	urls: {}
};

var html = jade.renderFile( 'server/pages/index.jade', renderVars );

// Generate the CSS required to render the initial shell.
critical.generate( {
	folder: 'public',
	html: html,
	css: [ 'public/style.css' ],
	width: 1300,
	height: 900,
	dest: 'public/shell.css',
	minify: true,
	extract: false,
	ignore: [ /environment/ ]
} );
