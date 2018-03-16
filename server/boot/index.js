/** @format */
/**
 * Module dependencies
 */

const path = require( 'path' ),
	build = require( 'build' ),
	config = require( 'config' ),
	chalk = require( 'chalk' ),
	express = require( 'express' ),
	cookieParser = require( 'cookie-parser' ),
	userAgent = require( 'express-useragent' ),
	morgan = require( 'morgan' ),
	pages = require( 'pages' );

const analytics = require( '../lib/analytics' ).default;

/**
 * Returns the server HTTP request handler "app".
 * @returns {object} The express app
 * @api public
 */
function setup() {
	const app = express();

	// for nginx
	app.enable( 'trust proxy' );

	app.use( cookieParser() );
	app.use( userAgent.express() );

	if ( 'development' === process.env.NODE_ENV ) {
		// use legacy CSS rebuild system if css-hot-reload is disabled
		if ( ! config.isEnabled( 'css-hot-reload' ) ) {
			// only do `build` upon every request in "development"
			app.use( build() );
		}

		require( 'bundler' )( app );

		// setup logger
		app.use( morgan( 'dev' ) );

		if ( config.isEnabled( 'wpcom-user-bootstrap' ) ) {
			if ( config( 'wordpress_logged_in_cookie' ) ) {
				const username = config( 'wordpress_logged_in_cookie' ).split( '%7C' )[ 0 ];
				console.info( chalk.cyan( '\nYour logged in cookie set to user: ' + username ) );

				app.use( function( req, res, next ) {
					if ( ! req.cookies.wordpress_logged_in ) {
						req.cookies.wordpress_logged_in = config( 'wordpress_logged_in_cookie' );
					}
					next();
				} );
			} else {
				console.info(
					chalk.red(
						'\nYou need to set `wordpress_logged_in_cookie` in secrets.json' +
							' for wpcom-user-bootstrap to work in development.'
					)
				);
			}
		}
	} else {
		// setup logger
		app.use( morgan( 'combined' ) );
	}

	// attach the static file server to serve the `public` dir
	app.use( '/calypso', express.static( path.resolve( __dirname, '..', '..', 'public' ) ) );

	// service-worker needs to be served from root to avoid scope issues
	app.use(
		'/service-worker.js',
		express.static(
			path.resolve( __dirname, '..', '..', 'client', 'lib', 'service-worker', 'service-worker.js' )
		)
	);

	// loaded when we detect stats blockers - see lib/analytics/index.js
	app.get( '/nostats.js', function( request, response ) {
		analytics.tracks.recordEvent(
			'calypso_stats_blocked',
			{
				do_not_track: request.headers.dnt,
			},
			request
		);
		response.setHeader( 'content-type', 'application/javascript' );
		response.end( "console.log('Stats are disabled');" );
	} );

	// serve files when not in production so that the source maps work correctly
	if ( 'development' === process.env.NODE_ENV ) {
		app.use( '/assets', express.static( path.resolve( __dirname, '..', '..', 'assets' ) ) );
		app.use( '/client', express.static( path.resolve( __dirname, '..', '..', 'client' ) ) );
	}

	if ( config.isEnabled( 'devdocs' ) ) {
		app.use( require( 'devdocs' )() );
	}

	if ( config.isEnabled( 'desktop' ) ) {
		app.use(
			'/desktop',
			express.static( path.resolve( __dirname, '..', '..', '..', 'public_desktop' ) )
		);
	}

	app.use( require( 'api' )() );

	// attach the pages module
	app.use( pages.default() );

	return app;
}

/**
 * Module exports
 */
module.exports = setup;
