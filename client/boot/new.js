// Initialize localStorage polyfill before any dependencies are loaded
require( 'lib/local-storage' )();
if ( process.env.NODE_ENV === 'development' ) {
	require( 'lib/wrap-es6-functions' )();
}

/**
 * External dependencies
 */
import debugFactory from 'debug';
import page from 'page';
import qs from 'querystring';
import ReactClass from 'react/lib/ReactClass';
import i18n, { setLocale } from 'i18n-calypso';
import url from 'url';

/**
 * Internal dependencies
 */
import accessibleFocus from 'lib/accessible-focus';
import createReduxStoreFromPersistedInitialState from 'state/initial-state';
import detectHistoryNavigation from 'lib/detect-history-navigation';
import touchDetect from 'lib/touch-detect';
import userFactory from 'lib/user';

const debug = debugFactory( 'calypso' );

export function boot( currentUser ) {
	debug( "Starting Calypso. Let\'s do this." );

	locales();
	utils();
	createReduxStoreFromPersistedInitialState( reduxStore => {
		setupMiddlewares( reduxStore );
		loadSections();

		// TODO: make project name dynamic based on config
		require( './wordpress-com' ).boot( currentUser, reduxStore );

		// TODO: init project specific middlewares

		detectHistoryNavigation.start();
		page.start();
	} );
}

function locales() {
	// Initialize i18n
	ReactClass.injection.injectMixin( i18n.mixin );

	if ( window.i18nLocaleStrings ) {
		const i18nLocaleStringsObject = JSON.parse( window.i18nLocaleStrings );
		setLocale( i18nLocaleStringsObject );
	}
}

function utils() {
	// Infer touch screen by checking if device supports touch events
	// See touch-detect/README.md
	if ( touchDetect.hasTouch() ) {
		document.documentElement.classList.add( 'touch' );
	} else {
		document.documentElement.classList.add( 'notouch' );
	}

	// Add accessible-focus listener
	accessibleFocus();
}

function setUpContext( reduxStore ) {
	page( '*', function( context, next ) {
		const parsed = url.parse( location.href, true );

		context.store = reduxStore;

		// Break routing and do full page load for logout link in /me
		if ( context.pathname === '/wp-login.php' ) {
			window.location.href = context.path;
			return;
		}

		// set `context.query`
		const querystringStart = context.canonicalPath.indexOf( '?' );

		if ( querystringStart !== -1 ) {
			context.query = qs.parse( context.canonicalPath.substring( querystringStart + 1 ) );
		} else {
			context.query = {};
		}

		context.prevPath = parsed.path === context.path ? false : parsed.path;

		// set `context.hash` (we have to parse manually)
		if ( parsed.hash && parsed.hash.length > 1 ) {
			try {
				context.hash = qs.parse( parsed.hash.substring( 1 ) );
			} catch ( e ) {
				debug( 'failed to query-string parse `location.hash`', e );
				context.hash = {};
			}
		} else {
			context.hash = {};
		}
		next();
	} );
}

function setupMiddlewares( reduxStore ) {
	setUpContext( reduxStore );

	// TODO: move other middlewares from project specific file
}

function loadSections() {
	// TODO: move from project specific file
}

window.AppBoot = function() {
	if ( process.env.NODE_ENV === 'development' ) {
		require( './dev-modules' )();
	}

	const user = userFactory();
	if ( user.initialized ) {
		boot( user );
	} else {
		user.once( 'change', function() {
			boot( user );
		} );
	}
};
