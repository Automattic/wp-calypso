/**
 * External dependencies
 */
import debugFactory from 'debug';
import page from 'page';
import { startsWith } from 'lodash';
import React from 'react';
import ReactDom from 'react-dom';
import Modal from 'react-modal';
import store from 'store';

/**
 * Internal dependencies
 */
import { setupLocale } from './locale';
import config from 'config';
import { ReduxWrappedLayout } from 'controller';
import notices from 'notices';
import { getToken } from 'lib/oauth-token';
import emailVerification from 'components/email-verification';
import { getSavedVariations } from 'lib/abtest'; // used by error logger
import accessibleFocus from 'lib/accessible-focus';
import Logger from 'lib/catch-js-errors';
import { bindState as bindWpLocaleState } from 'lib/wp/localization';
import { hasTouch } from 'lib/touch-detect';
import { installPerfmonPageHandlers } from 'lib/perfmon';
import { setupRoutes } from 'sections-middleware';
import { checkFormHandler } from 'lib/protect-form';
import { setReduxStore as setReduxBridgeReduxStore } from 'lib/redux-bridge';
import { init as pushNotificationsInit } from 'state/push-notifications/actions';
import { setSupportSessionReduxStore } from 'lib/user/support-user-interop';
import { tracksEvents } from 'lib/analytics/tracks';
import { initializeAnalytics } from 'lib/analytics/init';
import { bumpStat } from 'lib/analytics/mc';
import getSuperProps from 'lib/analytics/super-props';
import { getSiteFragment, normalize } from 'lib/route';
import { isLegacyRoute } from 'lib/route/legacy-routes';
import { setCurrentUser } from 'state/current-user/actions';
import { getCurrentUserId } from 'state/current-user/selectors';
import { initConnection as initHappychatConnection } from 'state/happychat/connection/actions';
import { requestHappychatEligibility } from 'state/happychat/user/actions';
import { getHappychatAuth } from 'state/happychat/utils';
import wasHappychatRecentlyActive from 'state/happychat/selectors/was-happychat-recently-active';
import { setRoute as setRouteAction } from 'state/ui/actions';
import { getSelectedSiteId, getSectionName } from 'state/ui/selectors';
import { setNextLayoutFocus, activateNextLayoutFocus } from 'state/ui/layout-focus/actions';
import setupGlobalKeyboardShortcuts from 'lib/keyboard-shortcuts/global';
import { createReduxStore } from 'state';
import initialReducer from 'state/reducer';
import { getInitialState, persistOnChange, loadAllState } from 'state/initial-state';
import detectHistoryNavigation from 'lib/detect-history-navigation';
import userFactory from 'lib/user';
import { getUrlParts, isOutsideCalypso } from 'lib/url';
import { setStore } from 'state/redux-store';

const debug = debugFactory( 'calypso' );

const setupContextMiddleware = ( reduxStore ) => {
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

		context.store = reduxStore;

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

		// Some paths live outside of Calypso and should be opened separately
		// Examples: /support, /forums
		if ( isOutsideCalypso( context.pathname ) ) {
			window.location.href = context.pathname;
			return;
		}

		next();
	} );

	page.exit( '*', ( context, next ) => {
		if ( ! context.store ) {
			context.store = reduxStore;
		}
		next();
	} );
};

const oauthTokenMiddleware = () => {
	if ( config.isEnabled( 'oauth' ) ) {
		const loggedOutRoutes = [
			'/oauth-login',
			'/oauth',
			'/start',
			'/authorize',
			'/api/oauth/token',
		];

		// Forces OAuth users to the /login page if no token is present
		page( '*', function ( context, next ) {
			const isValidSection = loggedOutRoutes.some( ( route ) => startsWith( context.path, route ) );

			// Check we have an OAuth token, otherwise redirect to auth/login page
			if ( getToken() === false && ! isValidSection ) {
				const isDesktop = [ 'desktop', 'desktop-development' ].includes( config( 'env_id' ) );
				const redirectPath = isDesktop ? config( 'login_url' ) : '/authorize';
				page( redirectPath );
				return;
			}

			next();
		} );
	}
};

const setRouteMiddleware = () => {
	page( '*', ( context, next ) => {
		context.store.dispatch( setRouteAction( context.pathname, context.query ) );

		next();
	} );
};

const clearNoticesMiddleware = () => {
	//TODO: remove this one when notices are reduxified - it is for old notices
	page( '*', notices.clearNoticesOnNavigation );
};

const unsavedFormsMiddleware = () => {
	// warn against navigating from changed, unsaved forms
	page.exit( '*', checkFormHandler );
};

const utils = () => {
	debug( 'Executing Calypso utils.' );

	// Infer touch screen by checking if device supports touch events
	// See touch-detect/README.md
	if ( hasTouch() ) {
		document.documentElement.classList.add( 'touch' );
	} else {
		document.documentElement.classList.add( 'notouch' );
	}

	// Add accessible-focus listener
	accessibleFocus();

	// Configure app element that React Modal will aria-hide when modal is open
	Modal.setAppElement( document.getElementById( 'wpcom' ) );
};

const configureReduxStore = ( currentUser, reduxStore ) => {
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

	setSupportSessionReduxStore( reduxStore );
	setReduxBridgeReduxStore( reduxStore );

	if ( currentUser.get() ) {
		if ( config.isEnabled( 'push-notifications' ) ) {
			// If the browser is capable, registers a service worker & exposes the API
			reduxStore.dispatch( pushNotificationsInit() );
		}
	}
};

function setupErrorLogger( reduxStore ) {
	if ( ! config.isEnabled( 'catch-js-errors' ) ) {
		return;
	}

	const errorLogger = new Logger();

	// Save errorLogger to a singleton for use in arbitrary logging.
	require( 'lib/catch-js-errors/log' ).registerLogger( errorLogger );

	// Save data to JS error logger
	errorLogger.saveDiagnosticData( {
		user_id: getCurrentUserId( reduxStore.getState() ),
		calypso_env: config( 'env_id' ),
	} );

	errorLogger.saveDiagnosticReducer( function () {
		const state = reduxStore.getState();
		return {
			blog_id: getSelectedSiteId( state ),
			calypso_section: getSectionName( state ),
		};
	} );

	errorLogger.saveDiagnosticReducer( () => ( { tests: getSavedVariations() } ) );

	tracksEvents.on( 'record-event', ( eventName, lastTracksEvent ) =>
		errorLogger.saveExtraData( { lastTracksEvent } )
	);

	page( '*', function ( context, next ) {
		errorLogger.saveNewPath(
			context.canonicalPath.replace( getSiteFragment( context.canonicalPath ), ':siteId' )
		);
		next();
	} );
}

const setupMiddlewares = ( currentUser, reduxStore ) => {
	debug( 'Executing Calypso setup middlewares.' );

	installPerfmonPageHandlers();
	setupContextMiddleware( reduxStore );
	oauthTokenMiddleware();
	setupRoutes();
	setRouteMiddleware();
	clearNoticesMiddleware();
	unsavedFormsMiddleware();

	// The analytics module requires user (when logged in) and superProps objects. Inject these here.
	initializeAnalytics( currentUser ? currentUser.get() : undefined, getSuperProps( reduxStore ) );

	setupErrorLogger( reduxStore );

	// If `?sb` or `?sp` are present on the path set the focus of layout
	// This can be removed when the legacy version is retired.
	page( '*', function ( context, next ) {
		if ( [ 'sb', 'sp' ].indexOf( context.querystring ) !== -1 ) {
			const layoutSection = context.querystring === 'sb' ? 'sidebar' : 'sites';
			reduxStore.dispatch( setNextLayoutFocus( layoutSection ) );
			page.replace( context.pathname );
		}

		next();
	} );

	page( '*', function ( context, next ) {
		// Don't normalize legacy routes - let them fall through and be unhandled
		// so that page redirects away from Calypso
		if ( isLegacyRoute( context.pathname ) ) {
			return next();
		}

		return normalize( context, next );
	} );

	page( '*', function ( context, next ) {
		const path = context.pathname;

		// Bypass this global handler for legacy routes
		// to avoid bumping stats and changing focus to the content
		if ( isLegacyRoute( path ) ) {
			return next();
		}

		// Focus UI on the content on page navigation
		if ( ! config.isEnabled( 'code-splitting' ) ) {
			context.store.dispatch( activateNextLayoutFocus() );
		}

		// Bump general stat tracking overall Newdash usage
		bumpStat( { newdash_pageviews: 'route' } );

		next();
	} );

	page( '*', function ( context, next ) {
		if ( '/me/account' !== context.path && currentUser.get().phone_account ) {
			page( '/me/account' );
		}

		next();
	} );

	page( '*', emailVerification );

	// delete any lingering local storage data from signup
	if ( ! startsWith( window.location.pathname, '/start' ) ) {
		[ 'signupProgress', 'signupDependencies' ].forEach( ( item ) => store.remove( item ) );
	}

	if ( ! currentUser.get() ) {
		// Dead-end the sections the user can't access when logged out
		page( '*', function ( context, next ) {
			//see server/pages/index for prod redirect
			if ( '/plans' === context.pathname ) {
				const queryFor = context.query && context.query.for;
				if ( queryFor && 'jetpack' === queryFor ) {
					window.location =
						'https://wordpress.com/wp-login.php?redirect_to=https%3A%2F%2Fwordpress.com%2Fplans';
				} else {
					// pricing page is outside of Calypso, needs a full page load
					window.location = 'https://wordpress.com/pricing';
				}
				return;
			}

			next();
		} );
	}

	const state = reduxStore.getState();
	if ( config.isEnabled( 'happychat' ) ) {
		reduxStore.dispatch( requestHappychatEligibility() );
	}
	if ( wasHappychatRecentlyActive( state ) ) {
		reduxStore.dispatch( initHappychatConnection( getHappychatAuth( state )() ) );
	}

	if ( config.isEnabled( 'keyboard-shortcuts' ) ) {
		setupGlobalKeyboardShortcuts();
	}

	if ( config.isEnabled( 'desktop' ) ) {
		require( 'lib/desktop' ).default.init();
	}

	if ( config.isEnabled( 'rubberband-scroll-disable' ) ) {
		asyncRequire( 'lib/rubberband-scroll-disable', ( disableRubberbandScroll ) => {
			disableRubberbandScroll( document.body );
		} );
	}

	if (
		config.isEnabled( 'dev/test-helper' ) &&
		document.querySelector( '.environment.is-tests' )
	) {
		asyncRequire( 'lib/abtest/test-helper', ( testHelper ) => {
			testHelper( document.querySelector( '.environment.is-tests' ) );
		} );
	}
	if (
		config.isEnabled( 'dev/preferences-helper' ) &&
		document.querySelector( '.environment.is-prefs' )
	) {
		asyncRequire( 'lib/preferences-helper', ( prefHelper ) => {
			prefHelper( document.querySelector( '.environment.is-prefs' ), reduxStore );
		} );
	}
};

function renderLayout( reduxStore ) {
	const layoutElement = React.createElement( ReduxWrappedLayout, {
		store: reduxStore,
	} );

	ReactDom.render( layoutElement, document.getElementById( 'wpcom' ) );

	debug( 'Main layout rendered.' );
}

const boot = ( currentUser, registerRoutes ) => {
	utils();
	loadAllState().then( () => {
		const initialState = getInitialState( initialReducer );
		const reduxStore = createReduxStore( initialState, initialReducer );
		setStore( reduxStore );
		persistOnChange( reduxStore );
		setupLocale( currentUser.get(), reduxStore );
		configureReduxStore( currentUser, reduxStore );
		setupMiddlewares( currentUser, reduxStore );
		detectHistoryNavigation.start();
		if ( registerRoutes ) {
			registerRoutes();
		}

		// Render initial `<Layout>` for non-isomorphic sections.
		// Isomorphic sections will take care of rendering their `<Layout>` themselves.
		if ( ! document.getElementById( 'primary' ) ) {
			renderLayout( reduxStore );
		}

		page.start( { decodeURLComponents: false } );
	} );
};

export const bootApp = ( appName, registerRoutes ) => {
	const user = userFactory();
	user.initialize().then( () => {
		debug( `Starting ${ appName }. Let's do this.` );
		boot( user, registerRoutes );
	} );
};
