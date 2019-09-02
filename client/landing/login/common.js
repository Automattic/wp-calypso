/**
 * External dependencies
 */
import { parse } from 'qs';
import page from 'page';
import url from 'url';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import config from 'config';
import { setCurrentUser } from 'state/current-user/actions';

const debug = debugFactory( 'calypso' );

export function setupContextMiddleware() {
	page( '*', ( context, next ) => {
		// page.js url parsing is broken so we had to disable it with `decodeURLComponents: false`
		const parsed = url.parse( context.canonicalPath, true );
		context.prevPath = parsed.path === context.path ? false : parsed.path;
		context.query = parsed.query;

		context.hashstring = ( parsed.hash && parsed.hash.substring( 1 ) ) || '';
		// set `context.hash` (we have to parse manually)
		if ( context.hashstring ) {
			try {
				context.hash = parse( context.hashstring );
			} catch ( e ) {
				debug( 'failed to query-string parse `location.hash`', e );
				context.hash = {};
			}
		} else {
			context.hash = {};
		}

		// client version of the isomorphic method for redirecting to another page
		context.redirect = ( httpCode, newUrl = null ) => {
			if ( isNaN( httpCode ) && ! newUrl ) {
				newUrl = httpCode;
			}

			return page.replace( newUrl, context.state, false, false );
		};

		// Break routing and do full load for logout link in /me
		if ( context.pathname === '/wp-login.php' ) {
			window.location.href = context.path;
			return;
		}

		next();
	} );
}

export const configureReduxStore = ( currentUser, reduxStore ) => {
	debug( 'Executing Calypso configure Redux store.' );

	if ( currentUser.get() ) {
		// Set current user in Redux store
		reduxStore.dispatch( setCurrentUser( currentUser.get() ) );
		currentUser.on( 'change', () => {
			reduxStore.dispatch( setCurrentUser( currentUser.get() ) );
		} );
	}

	if ( config.isEnabled( 'network-connection' ) ) {
		asyncRequire( 'lib/network-connection', networkConnection =>
			networkConnection.init( reduxStore )
		);
	}
};

export function setupMiddlewares( currentUser, reduxStore ) {
	setupContextMiddleware( reduxStore );
}
