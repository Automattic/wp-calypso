/**
 * External dependencies
 */
import path from 'path';
import chalk from 'chalk';
import express from 'express';
import cookieParser from 'cookie-parser';
import userAgent from 'express-useragent';
import morgan from 'morgan';

/**
 * Internal dependencies
 */
import analytics from 'server/lib/analytics';
import config from 'server/config';
import api from 'server/api';
import pages from 'server/pages';
import pwa from 'server/pwa';

/**
 * Returns the server HTTP request handler "app".
 *
 * @returns {object} The express app
 */
export default function setup() {
	const app = express();

	// for nginx
	app.enable( 'trust proxy' );

	app.use( cookieParser() );
	app.use( userAgent.express() );

	if ( 'development' === process.env.NODE_ENV ) {
		require( 'server/bundler' )( app );

		// setup logger
		app.use( morgan( 'dev' ) );

		if ( config.isEnabled( 'wpcom-user-bootstrap' ) ) {
			if ( config( 'wordpress_logged_in_cookie' ) ) {
				const username = config( 'wordpress_logged_in_cookie' ).split( '%7C' )[ 0 ];
				console.info( chalk.cyan( '\nYour logged in cookie set to user: ' + username ) );

				app.use( function ( req, res, next ) {
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

			// Use try/catch because config() will throw for missing keys in development mode,
			// and we don't want an exception if `support_session_id_cookie` is undefined.
			try {
				const supportSessionIdCookie = config( 'support_session_id_cookie' );
				if ( supportSessionIdCookie ) {
					app.use( function ( req, res, next ) {
						if ( ! req.cookies.support_session_id ) {
							req.cookies.support_session_id = supportSessionIdCookie;
						}
						next();
					} );
				}
			} catch ( e ) {}
		}
	} else {
		// setup logger
		app.use( morgan( 'combined' ) );
	}

	app.use( pwa() );

	// attach the static file server to serve the `public` dir
	app.use( '/calypso', express.static( path.resolve( __dirname, '..', '..', '..', 'public' ) ) );

	// loaded when we detect stats blockers - see lib/analytics/index.js
	app.get( '/nostats.js', function ( request, response ) {
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

	if ( config.isEnabled( 'devdocs' ) ) {
		app.use( require( 'server/devdocs' ).default() );
	}

	if ( config.isEnabled( 'desktop' ) ) {
		app.use(
			'/desktop',
			express.static( path.resolve( __dirname, '..', '..', '..', 'public_desktop' ) )
		);
	}

	app.use( api() );

	// attach the pages module
	app.use( pages() );

	return app;
}
