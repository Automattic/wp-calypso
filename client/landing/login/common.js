/**
 * External dependencies
 */
import page from 'page';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import config from 'config';
import { initializeAnalytics } from 'lib/analytics/init';
import getSuperProps from 'lib/analytics/super-props';
import { bindState as bindWpLocaleState } from 'lib/wp/localization';
import { getUrlParts } from 'lib/url';
import { setCurrentUser } from 'state/current-user/actions';
import setRouteAction from 'state/ui/actions/set-route';

const debug = debugFactory( 'calypso' );

export function setupContextMiddleware() {
	page( '*', ( context, next ) => {
		// page.js url parsing is broken so we had to disable it with `decodeURLComponents: false`
		const parsed = getUrlParts( context.canonicalPath );
		const path = parsed.pathname + parsed.search || null;
		context.prevPath = path === context.path ? false : path;
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

function renderDevHelpers( reduxStore ) {
	if ( config.isEnabled( 'dev/test-helper' ) ) {
		const testHelperEl = document.querySelector( '.environment.is-tests' );
		if ( testHelperEl ) {
			asyncRequire( 'lib/abtest/test-helper', ( testHelper ) => {
				testHelper( testHelperEl );
			} );
		}
	}

	if ( config.isEnabled( 'dev/preferences-helper' ) ) {
		const prefHelperEl = document.querySelector( '.environment.is-prefs' );
		if ( prefHelperEl ) {
			asyncRequire( 'lib/preferences-helper', ( prefHelper ) => {
				prefHelper( prefHelperEl, reduxStore );
			} );
		}
	}
}

export const configureReduxStore = ( currentUser, reduxStore ) => {
	debug( 'Executing Calypso configure Redux store.' );

	bindWpLocaleState( reduxStore );

	if ( currentUser.get() ) {
		// Set current user in Redux store
		reduxStore.dispatch( setCurrentUser( currentUser.get() ) );
		currentUser.on( 'change', () => {
			reduxStore.dispatch( setCurrentUser( currentUser.get() ) );
		} );
	}

	if ( config.isEnabled( 'network-connection' ) ) {
		asyncRequire( 'lib/network-connection', ( networkConnection ) =>
			networkConnection.init( reduxStore )
		);
	}
};

const setRouteMiddleware = ( reduxStore ) => {
	page( '*', ( context, next ) => {
		reduxStore.dispatch( setRouteAction( context.pathname, context.query ) );

		next();
	} );
};

const setAnalyticsMiddleware = ( currentUser, reduxStore ) => {
	initializeAnalytics( currentUser ? currentUser.get() : undefined, getSuperProps( reduxStore ) );
};

export function setupMiddlewares( currentUser, reduxStore ) {
	setupContextMiddleware( reduxStore );
	setRouteMiddleware( reduxStore );
	setAnalyticsMiddleware( currentUser, reduxStore );
	renderDevHelpers( reduxStore );
}
