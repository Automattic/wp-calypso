import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { getUrlParts } from '@automattic/calypso-url';
import debugFactory from 'debug';
import { initializeAnalytics } from 'calypso/lib/analytics/init';
import getSuperProps from 'calypso/lib/analytics/super-props';
import loadDevHelpers from 'calypso/lib/load-dev-helpers';
import { setCurrentUser } from 'calypso/state/current-user/actions';
import { setRoute } from 'calypso/state/route/actions';

const debug = debugFactory( 'calypso' );

export function setupContextMiddleware() {
	let previousPath = null;

	page( '*', ( context, next ) => {
		const parsed = getUrlParts( context.canonicalPath );

		context.previousPath = previousPath;
		previousPath = context.path;

		context.query = Object.fromEntries( parsed.searchParams.entries() );

		context.hashstring = ( parsed.hash && parsed.hash.substring( 1 ) ) || '';
		// set `context.hash` (we have to parse manually)
		if ( context.hashstring ) {
			try {
				context.hash = Object.fromEntries(
					new globalThis.URLSearchParams( context.hashstring ).entries()
				);
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

	if ( currentUser && currentUser.ID ) {
		// Set current user in Redux store
		reduxStore.dispatch( setCurrentUser( currentUser ) );
	}

	if ( config.isEnabled( 'network-connection' ) ) {
		asyncRequire( 'calypso/lib/network-connection' ).then( ( networkConnection ) =>
			networkConnection.default.init( reduxStore )
		);
	}
};

const setRouteMiddleware = ( reduxStore ) => {
	page( '*', ( context, next ) => {
		reduxStore.dispatch( setRoute( context.pathname, context.query ) );

		next();
	} );
};

const setAnalyticsMiddleware = ( currentUser, reduxStore ) => {
	initializeAnalytics( currentUser ? currentUser : undefined, getSuperProps( reduxStore ) );
};

export function setupMiddlewares( currentUser, reduxStore ) {
	setupContextMiddleware();
	setRouteMiddleware( reduxStore );
	setAnalyticsMiddleware( currentUser, reduxStore );
	loadDevHelpers( reduxStore );
}
