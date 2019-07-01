/** @format */

/**
 * External dependencies
 */

import debugFactory from 'debug';
import page from 'page';
import { parse } from 'qs';
import url from 'url';
import { get, startsWith } from 'lodash';
import React from 'react';
import ReactDom from 'react-dom';
import store from 'store';

/**
 * Internal dependencies
 */
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
import analytics from 'lib/analytics';
import superProps from 'lib/analytics/super-props';
import { getSiteFragment, normalize } from 'lib/route';
import { isLegacyRoute } from 'lib/route/legacy-routes';
import { setCurrentUser } from 'state/current-user/actions';
import { initConnection as initHappychatConnection } from 'state/happychat/connection/actions';
import { requestHappychatEligibility } from 'state/happychat/user/actions';
import { getHappychatAuth } from 'state/happychat/utils';
import wasHappychatRecentlyActive from 'state/happychat/selectors/was-happychat-recently-active';
import { setRoute as setRouteAction } from 'state/ui/actions';
import { getSelectedSiteId, getSectionName } from 'state/ui/selectors';
import { setLocale, setLocaleRawData } from 'state/ui/language/actions';
import { setNextLayoutFocus, activateNextLayoutFocus } from 'state/ui/layout-focus/actions';
import setupGlobalKeyboardShortcuts from 'lib/keyboard-shortcuts/global';
import { loadUserUndeployedTranslations } from 'lib/i18n-utils/switch-locale';

const debug = debugFactory( 'calypso' );

const switchUserLocale = ( currentUser, reduxStore ) => {
	const { localeSlug, localeVariant } = currentUser.get();

	if ( localeSlug ) {
		reduxStore.dispatch( setLocale( localeSlug, localeVariant ) );
	}
};

const setupContextMiddleware = reduxStore => {
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

		next();
	} );

	page.exit( '*', ( context, next ) => {
		if ( ! context.store ) {
			context.store = reduxStore;
		}
		next();
	} );
};

// We need to require sections to load React with i18n mixin
const loadSectionsMiddleware = () => setupRoutes();

const loggedOutMiddleware = currentUser => {
	if ( currentUser.get() ) {
		return;
	}

	if ( config.isEnabled( 'desktop' ) ) {
		page( '/', () => {
			if ( config.isEnabled( 'oauth' ) ) {
				page.redirect( '/authorize' );
			} else {
				page.redirect( '/log-in' );
			}
		} );
	} else if ( config.isEnabled( 'devdocs/redirect-loggedout-homepage' ) ) {
		page( '/', () => {
			page.redirect( '/devdocs/start' );
		} );
	}
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
		page( '*', function( context, next ) {
			const isValidSection = loggedOutRoutes.some( route => startsWith( context.path, route ) );

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

export const locales = ( currentUser, reduxStore ) => {
	debug( 'Executing Calypso locales.' );

	if ( window.i18nLocaleStrings ) {
		const i18nLocaleStringsObject = JSON.parse( window.i18nLocaleStrings );
		reduxStore.dispatch( setLocaleRawData( i18nLocaleStringsObject ) );
		const languageSlug = get( i18nLocaleStringsObject, [ '', 'localeSlug' ] );
		if ( languageSlug ) {
			debug( 'Checking for load-user-translations parameter' );
			loadUserUndeployedTranslations( languageSlug );
		}
	}

	// Use current user's locale if it was not bootstrapped (non-ssr pages)
	if (
		! window.i18nLocaleStrings &&
		! config.isEnabled( 'wpcom-user-bootstrap' ) &&
		currentUser.get()
	) {
		switchUserLocale( currentUser, reduxStore );
	}
};

export const utils = () => {
	debug( 'Executing Calypso utils.' );

	if ( process.env.NODE_ENV === 'development' ) {
		require( './dev-modules' ).default();
	}

	// Infer touch screen by checking if device supports touch events
	// See touch-detect/README.md
	if ( hasTouch() ) {
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

	setSupportSessionReduxStore( reduxStore );
	setReduxBridgeReduxStore( reduxStore );

	if ( currentUser.get() ) {
		if ( config.isEnabled( 'push-notifications' ) ) {
			// If the browser is capable, registers a service worker & exposes the API
			reduxStore.dispatch( pushNotificationsInit() );
		}
	}
};

export const setupMiddlewares = ( currentUser, reduxStore ) => {
	debug( 'Executing Calypso setup middlewares.' );

	installPerfmonPageHandlers();
	setupContextMiddleware( reduxStore );
	oauthTokenMiddleware();
	loadSectionsMiddleware();
	loggedOutMiddleware( currentUser );
	setRouteMiddleware();
	clearNoticesMiddleware();
	unsavedFormsMiddleware();

	analytics.setDispatch( reduxStore.dispatch );

	if ( currentUser.get() ) {
		// When logged in the analytics module requires user and superProps objects
		// Inject these here
		analytics.initialize( currentUser, superProps );
	} else {
		analytics.setSuperProps( superProps );
	}

	// Render Layout only for non-isomorphic sections.
	// Isomorphic sections will take care of rendering their Layout last themselves.
	if ( ! document.getElementById( 'primary' ) ) {
		renderLayout( reduxStore );

		if ( config.isEnabled( 'catch-js-errors' ) ) {
			const errorLogger = new Logger();
			//Save errorLogger to a singleton for use in arbitrary logging.
			require( 'lib/catch-js-errors/log' ).registerLogger( errorLogger );
			//Save data to JS error logger
			errorLogger.saveDiagnosticData( {
				user_id: currentUser.get().ID,
				calypso_env: config( 'env_id' ),
			} );
			errorLogger.saveDiagnosticReducer( function() {
				const state = reduxStore.getState();
				return {
					blog_id: getSelectedSiteId( state ),
					calypso_section: getSectionName( state ),
				};
			} );
			errorLogger.saveDiagnosticReducer( () => ( { tests: getSavedVariations() } ) );
			analytics.on( 'record-event', ( eventName, eventProperties ) =>
				errorLogger.saveExtraData( { lastTracksEvent: eventProperties } )
			);
			page( '*', function( context, next ) {
				errorLogger.saveNewPath(
					context.canonicalPath.replace( getSiteFragment( context.canonicalPath ), ':siteId' )
				);
				next();
			} );
		}
	}

	// If `?sb` or `?sp` are present on the path set the focus of layout
	// This can be removed when the legacy version is retired.
	page( '*', function( context, next ) {
		if ( [ 'sb', 'sp' ].indexOf( context.querystring ) !== -1 ) {
			const layoutSection = context.querystring === 'sb' ? 'sidebar' : 'sites';
			reduxStore.dispatch( setNextLayoutFocus( layoutSection ) );
			page.replace( context.pathname );
		}

		next();
	} );

	page( '*', function( context, next ) {
		// Don't normalize legacy routes - let them fall through and be unhandled
		// so that page redirects away from Calypso
		if ( isLegacyRoute( context.pathname ) ) {
			return next();
		}

		return normalize( context, next );
	} );

	page( '*', function( context, next ) {
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
		analytics.mc.bumpStat( { newdash_pageviews: 'route' } );

		next();
	} );

	page( '*', function( context, next ) {
		if ( '/me/account' !== context.path && currentUser.get().phone_account ) {
			page( '/me/account' );
		}

		next();
	} );

	page( '*', emailVerification );

	// delete any lingering local storage data from signup
	if ( ! startsWith( window.location.pathname, '/start' ) ) {
		[ 'signupProgress', 'signupDependencies' ].forEach( item => store.remove( item ) );
	}

	if ( ! currentUser.get() ) {
		// Dead-end the sections the user can't access when logged out
		page( '*', function( context, next ) {
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
		asyncRequire( 'lib/rubberband-scroll-disable', disableRubberbandScroll => {
			disableRubberbandScroll( document.body );
		} );
	}

	if (
		config.isEnabled( 'dev/test-helper' ) &&
		document.querySelector( '.environment.is-tests' )
	) {
		asyncRequire( 'lib/abtest/test-helper', testHelper => {
			testHelper( document.querySelector( '.environment.is-tests' ) );
		} );
	}
	if (
		config.isEnabled( 'dev/preferences-helper' ) &&
		document.querySelector( '.environment.is-prefs' )
	) {
		asyncRequire( 'lib/preferences-helper', prefHelper => {
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
