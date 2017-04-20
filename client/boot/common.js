/**
 * External dependencies
 */
import debugFactory from 'debug';
import page from 'page';
import qs from 'querystring';
import ReactClass from 'react/lib/ReactClass';
import i18n, { setLocale } from 'i18n-calypso';
import { some, startsWith } from 'lodash';
import url from 'url';

/**
 * Internal dependencies
 */
import accessibleFocus from 'lib/accessible-focus';
import { bindState as bindWpLocaleState } from 'lib/wp/localization';
import config from 'config';
import { receiveUser } from 'state/users/actions';
import {
	setCurrentUserId,
	setCurrentUserFlags
} from 'state/current-user/actions';
import { setRoute as setRouteAction } from 'state/ui/actions';
import switchLocale from 'lib/i18n-utils/switch-locale';
import touchDetect from 'lib/touch-detect';

const debug = debugFactory( 'calypso' );

const switchUserLocale = currentUser => {
	const localeSlug = currentUser.get().localeSlug;
	if ( localeSlug ) {
		switchLocale( localeSlug );
	}
};

const setupContextMiddleware = reduxStore => {
	page( '*', ( context, next ) => {
		const parsed = url.parse( location.href, true );

		context.store = reduxStore;

		// Break routing and do full load for logout link in /me
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
};

// We need to require sections to load React with i18n mixin
const loadSectionsMiddleware = () => require( 'sections' ).load();

const loggedOutMiddleware = currentUser => {
	if ( currentUser.get() ) {
		return;
	}

	if ( config.isEnabled( 'devdocs/redirect-loggedout-homepage' ) ) {
		page( '/', () => {
			if ( config.isEnabled( 'oauth' ) ) {
				page.redirect( '/authorize' );
			} else {
				page.redirect( '/devdocs/start' );
			}
		} );
	}

	const sections = require( 'sections' );
	const validSections = sections.get().reduce( ( acc, section ) => {
		return section.enableLoggedOut ? acc.concat( section.paths ) : acc;
	}, [] );
	const isValidSection = sectionPath => some(
		validSections, validPath => startsWith( sectionPath, validPath )
	);

	page( '*', ( context, next ) => {
		if ( isValidSection( context.path ) ) {
			next();
		}
	} );
};

const oauthTokenMiddleware = () => {
	if ( config.isEnabled( 'oauth' ) ) {
		// Forces OAuth users to the /login page if no token is present
		page( '*', require( 'auth/controller' ).checkToken );
	}
};

const clearNoticesMiddleware = () => {
	page( '*', function( context, next ) {
		context.store.dispatch( setRouteAction(
			context.pathname,
			context.query
		) );

		next();
	} );

	//TODO: remove this one when notices are reduxified - it is for old notices
	page( '*', require( 'notices' ).clearNoticesOnNavigation );
};

const unsavedFormsMiddleware = () => {
	// warn against navigating from changed, unsaved forms
	page.exit( '*', require( 'lib/protect-form' ).checkFormHandler );
};

export const locales = currentUser => {
	debug( 'Executing Calypso locales.' );

	// Initialize i18n mixin
	ReactClass.injection.injectMixin( i18n.mixin );

	if ( window.i18nLocaleStrings ) {
		const i18nLocaleStringsObject = JSON.parse( window.i18nLocaleStrings );
		setLocale( i18nLocaleStringsObject );
	}

	// When the user is not bootstrapped, we also bootstrap the
	// locale strings
	if ( ! config( 'wpcom_user_bootstrap' ) ) {
		switchUserLocale( currentUser );
	}

	currentUser.on( 'change', () => switchUserLocale( currentUser ) );
};

export const utils = () => {
	debug( 'Executing Calypso utils.' );

	if ( process.env.NODE_ENV === 'development' ) {
		require( './dev-modules' )();
	}

	// Infer touch screen by checking if device supports touch events
	// See touch-detect/README.md
	if ( touchDetect.hasTouch() ) {
		document.documentElement.classList.add( 'touch' );
	} else {
		document.documentElement.classList.add( 'notouch' );
	}

	// Add accessible-focus listener
	accessibleFocus();
};

export const configureReduxStore = ( currentUser, reduxStore ) => {
	debug( 'Executing Calypso configure Redux store.' );

	bindWpLocaleState( reduxStore );

	if ( currentUser.get() ) {
		// Set current user in Redux store
		reduxStore.dispatch( receiveUser( currentUser.get() ) );
		currentUser.on( 'change', () => {
			reduxStore.dispatch( receiveUser( currentUser.get() ) );
		} );
		reduxStore.dispatch( setCurrentUserId( currentUser.get().ID ) );
		reduxStore.dispatch( setCurrentUserFlags( currentUser.get().meta.data.flags.active_flags ) );
	}

	if ( config.isEnabled( 'network-connection' ) ) {
		asyncRequire( 'lib/network-connection', networkConnection => networkConnection.init( reduxStore ) );
	}
};

export const setupMiddlewares = ( currentUser, reduxStore ) => {
	debug( 'Executing Calypso setup middlewares.' );

	setupContextMiddleware( reduxStore );
	oauthTokenMiddleware();
	loadSectionsMiddleware();
	loggedOutMiddleware( currentUser );
	clearNoticesMiddleware();
	unsavedFormsMiddleware();
};
