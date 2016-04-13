/**
 * Module dependencies
 */
var path = require( 'path' ),
	build = require( 'build' ),
	config = require( 'config' ),
	express = require( 'express' ),
	morgan = require( 'morgan' ),
	pages = require( 'pages' ),
	ReactEngine = require( 'express-react-views' );

var CALYPSO_ENV = process.env.CALYPSO_ENV || process.env.NODE_ENV || 'development';

/**
 * Returns the server HTTP request handler "app".
 *
 * @api public
 * @returns { object } Express app
 */
function setup() {
	var app = express(),
		assets,
		devdocs,
		api,
		bundler,
		engine;

	// for nginx
	app.enable( 'trust proxy' );

	// template engine
	engine = ReactEngine.createEngine( {
		transformViews: true,
		beautify: CALYPSO_ENV === 'development'
	} );
	app.engine( '.jsx', engine );
	app.set( 'view engine', 'jsx' );

	if ( 'development' === config( 'env' ) ) {
		// use legacy CSS rebuild system if css-hot-reload is disabled
		if ( ! config.isEnabled( 'css-hot-reload' ) ) {
			// only do `make build` upon every request in "development"
			app.use( build() );
		}

		bundler = require( 'bundler' );
		bundler( app );

		// setup logger
		app.use( morgan( 'dev' ) );
	} else {
		assets = require( 'bundler/assets' );
		assets( app );

		// setup logger
		app.use( morgan( 'combined' ) );
	}

	// attach the static file server to serve the `public` dir
	app.use( '/calypso', express.static( path.resolve( __dirname, '..', '..', 'public' ) ) );

	// service-worker needs to be served from root to avoid scope issues
	app.use( '/service-worker.js', express.static( path.resolve( __dirname, '..', '..', 'client', 'lib', 'service-worker', 'service-worker.js' ) ) );

	// serve files when not in production so that the source maps work correctly
	if ( 'development' === config( 'env' ) ) {
		app.use( '/assets', express.static( path.resolve( __dirname, '..', '..', 'assets' ) ) );
		app.use( '/client', express.static( path.resolve( __dirname, '..', '..', 'client' ) ) );
	}

	if ( config.isEnabled( 'devdocs' ) ) {
		devdocs = require( 'devdocs' );
		app.use( devdocs() );
	}

	if ( config.isEnabled( 'desktop' ) ) {
		app.use( '/desktop', express.static( path.resolve( __dirname, '..', '..', '..', 'public_desktop' ) ) );
	}

	api = require( 'api' );
	app.use( api() );

	// attach the pages module
	app.use( pages() );

	return app;
}

/**
 * Module exports
 */
module.exports = setup;
