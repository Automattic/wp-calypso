import accessibleFocus from '@automattic/accessible-focus';
import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { addBreadcrumb, initSentry } from '@automattic/calypso-sentry';
import { getUrlParts } from '@automattic/calypso-url';
import { geolocateCurrencySymbol } from '@automattic/format-currency';
import { getLanguageSlugs } from '@automattic/i18n-utils';
import { getToken } from '@automattic/oauth-token';
import { JETPACK_PRICING_PAGE } from '@automattic/urls';
import debugFactory from 'debug';
import ReactDom from 'react-dom';
import Modal from 'react-modal';
import store from 'store';
import emailVerification from 'calypso/components/email-verification';
import { ProviderWrappedLayout } from 'calypso/controller';
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import { initializeAnalytics } from 'calypso/lib/analytics/init';
import getSuperProps from 'calypso/lib/analytics/super-props';
import { tracksEvents } from 'calypso/lib/analytics/tracks';
import Logger from 'calypso/lib/catch-js-errors';
import DesktopListeners from 'calypso/lib/desktop-listeners';
import detectHistoryNavigation from 'calypso/lib/detect-history-navigation';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import loadDevHelpers from 'calypso/lib/load-dev-helpers';
import { attachLogmein } from 'calypso/lib/logmein';
import { checkFormHandler } from 'calypso/lib/protect-form';
import { setReduxStore as setReduxBridgeReduxStore } from 'calypso/lib/redux-bridge';
import { getSiteFragment, normalize } from 'calypso/lib/route';
import { isLegacyRoute } from 'calypso/lib/route/legacy-routes';
import { hasTouch } from 'calypso/lib/touch-detect';
import { isOutsideCalypso } from 'calypso/lib/url';
import { initializeCurrentUser } from 'calypso/lib/user/shared-utils';
import { onDisablePersistence } from 'calypso/lib/user/store';
import { setSupportSessionReduxStore } from 'calypso/lib/user/support-user-interop';
import { setupRoutes } from 'calypso/sections-middleware';
import { createReduxStore } from 'calypso/state';
import { setCurrentUser } from 'calypso/state/current-user/actions';
import { getCurrentUserId, isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getInitialState, getStateFromCache, persistOnChange } from 'calypso/state/initial-state';
import { init as pushNotificationsInit } from 'calypso/state/push-notifications/actions';
import {
	createQueryClient,
	getInitialQueryState,
	hydrateServerState,
} from 'calypso/state/query-client';
import initialReducer from 'calypso/state/reducer';
import { setStore } from 'calypso/state/redux-store';
import { setRoute } from 'calypso/state/route/actions';
import { setNextLayoutFocus } from 'calypso/state/ui/layout-focus/actions';
import { getSelectedSiteId, getSectionName } from 'calypso/state/ui/selectors';
import { setupLocale } from './locale';

const debug = debugFactory( 'calypso' );

const setupContextMiddleware = ( reduxStore, reactQueryClient ) => {
	page( '*', ( context, next ) => {
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
		context.queryClient = reactQueryClient;

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
			window.location.href = context.path;
			return;
		}

		next();
	} );

	page.exit( '*', ( context, next ) => {
		context.store = reduxStore;
		context.queryClient = reactQueryClient;

		next();
	} );
};

/**
 * If the URL sets `flags=oauth` explicitly, persist that setting to session storage so
 * that it persists across redirects and reloads. The `calypso-config` module will pick
 * them up automatically on init.
 */
function saveOauthFlags() {
	if ( ! window.location.search ) {
		return;
	}

	const flags = new URLSearchParams( window.location.search ).get( 'flags' );
	if ( ! flags ) {
		return;
	}

	const oauthFlag = flags.split( ',' ).find( ( flag ) => /^[+-]?oauth$/.test( flag ) );
	if ( ! oauthFlag ) {
		return;
	}

	window.sessionStorage.setItem( 'flags', oauthFlag );
}

function authorizePath() {
	const redirectUri = new URL(
		isJetpackCloud() || isA8CForAgencies() ? '/connect/oauth/token' : '/api/oauth/token',
		window.location
	);
	redirectUri.search = new URLSearchParams( {
		next: window.location.pathname + window.location.search,
	} ).toString();

	const authUri = new URL( 'https://public-api.wordpress.com/oauth2/authorize' );
	authUri.search = new URLSearchParams( {
		response_type: 'token',
		client_id: config( 'oauth_client_id' ),
		redirect_uri: redirectUri.toString(),
		scope: 'global',
		blog_id: 0,
	} ).toString();

	return authUri.toString();
}

const JP_CLOUD_PUBLIC_ROUTES = [ '/pricing', '/plans', '/features/comparison', '/manage/pricing' ];
const A4A_PUBLIC_ROUTES = [ '/signup' ];

const oauthTokenMiddleware = () => {
	if ( config.isEnabled( 'oauth' ) ) {
		const loggedOutRoutes = [ '/start', '/api/oauth/token', '/connect' ];

		if ( isJetpackCloud() ) {
			loggedOutRoutes.push( ...JP_CLOUD_PUBLIC_ROUTES );
			getLanguageSlugs().forEach( ( slug ) => {
				loggedOutRoutes.push(
					...JP_CLOUD_PUBLIC_ROUTES.map( ( route ) => `/${ slug }${ route }` )
				);
			} );
		}

		if ( isA8CForAgencies() ) {
			loggedOutRoutes.push( ...A4A_PUBLIC_ROUTES );
		}

		// Forces OAuth users to the /login page if no token is present
		page( '*', function ( context, next ) {
			const isValidSection = loggedOutRoutes.some( ( route ) => context.path.startsWith( route ) );

			// Check we have an OAuth token, otherwise redirect to auth/login page
			if ( getToken() === false && ! isValidSection ) {
				window.location = authorizePath();
				return;
			}

			next();
		} );
	}
};

const setRouteMiddleware = () => {
	page( '*', ( context, next ) => {
		context.store.dispatch( setRoute( context.pathname, context.query ) );

		next();
	} );
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

	if ( currentUser && currentUser.ID ) {
		// Set current user in Redux store
		reduxStore.dispatch( setCurrentUser( currentUser ) );
	}

	if ( config.isEnabled( 'network-connection' ) ) {
		asyncRequire( 'calypso/lib/network-connection' ).then( ( networkConnection ) =>
			networkConnection.default.init( reduxStore )
		);
	}

	setSupportSessionReduxStore( reduxStore );
	setReduxBridgeReduxStore( reduxStore );

	if ( currentUser ) {
		if ( config.isEnabled( 'push-notifications' ) ) {
			// If the browser is capable, registers a service worker & exposes the API
			reduxStore.dispatch( pushNotificationsInit() );
		}
	}
};

export function setupErrorLogger( reduxStore ) {
	// Add a bit of metadata from the redux store to the sentry event.
	const beforeSend = ( event ) => {
		const state = reduxStore.getState();
		const tags = {
			blog_id: getSelectedSiteId( state ),
			calypso_section: getSectionName( state ),
		};

		event.tags = {
			...tags,
			...event.tags,
		};

		return event;
	};

	// Note that Sentry can disable itself and do some cleanup if needed, so we
	// run it before the catch-js-errors check. (Otherwise, cleanup would never
	// never happen.)
	initSentry( { beforeSend, userId: getCurrentUserId( reduxStore.getState() ) } );

	if ( ! config.isEnabled( 'catch-js-errors' ) ) {
		return;
	}

	// At this point, the normal error logger is still set up so that logstash
	// contains a definitive log of calypso errors.
	const errorLogger = new Logger();

	// Save errorLogger to a singleton for use in arbitrary logging.
	require( 'calypso/lib/catch-js-errors/log' ).registerLogger( errorLogger );

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

	tracksEvents.on( 'record-event', ( eventName, lastTracksEvent ) =>
		errorLogger.saveExtraData( { lastTracksEvent } )
	);

	let prevPath;
	page( '*', function ( context, next ) {
		const path = context.canonicalPath.replace(
			getSiteFragment( context.canonicalPath ),
			':siteId'
		);
		// Also save the context to Sentry for easier debugging.
		addBreadcrumb( {
			category: 'navigation',
			data: {
				from: prevPath ?? path,
				to: path,
				should_capture: true, // Hint that this is our own breadcrumb, not the default navigation one.
			},
		} );
		prevPath = path;
		errorLogger.saveNewPath( path );
		next();
	} );
}

const setupMiddlewares = ( currentUser, reduxStore, reactQueryClient ) => {
	debug( 'Executing Calypso setup middlewares.' );

	setupContextMiddleware( reduxStore, reactQueryClient );
	oauthTokenMiddleware();
	setupRoutes();
	setRouteMiddleware();
	unsavedFormsMiddleware();

	// The analytics module requires user (when logged in) and superProps objects. Inject these here.
	initializeAnalytics( currentUser ? currentUser : undefined, getSuperProps( reduxStore ) );

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
		if ( '/me/account' !== context.path && currentUser.phone_account ) {
			page( '/me/account' );
		}

		next();
	} );

	page( '*', emailVerification );

	// delete any lingering local storage data from signup
	if ( ! window.location.pathname.startsWith( '/start' ) ) {
		[ 'signupProgress', 'signupDependencies' ].forEach( ( item ) => store.remove( item ) );
	}

	if ( ! currentUser ) {
		// Dead-end the sections the user can't access when logged out
		page( '*', function ( context, next ) {
			// see server/pages/index for prod redirect
			if ( '/plans' === context.pathname ) {
				const queryFor = context.query && context.query.for;
				if ( queryFor && 'jetpack' === queryFor ) {
					window.location =
						'https://wordpress.com/wp-login.php?redirect_to=https%3A%2F%2Fwordpress.com%2Fplans';
				} else {
					// pricing page is outside of Calypso, needs a full page load
					window.location = isJetpackCloud()
						? JETPACK_PRICING_PAGE
						: 'https://wordpress.com/pricing/';
				}
				return;
			}

			next();
		} );
	}

	if ( window.electron ) {
		DesktopListeners.init( reduxStore );
	}

	loadDevHelpers( reduxStore );

	if ( config.isEnabled( 'logmein' ) && isUserLoggedIn( reduxStore.getState() ) ) {
		// Attach logmein handler if we're currently logged in
		attachLogmein( reduxStore );
	}
};

function renderLayout( reduxStore, reactQueryClient ) {
	ReactDom.render(
		<ProviderWrappedLayout store={ reduxStore } queryClient={ reactQueryClient } />,
		document.getElementById( 'wpcom' )
	);
}

const boot = async ( currentUser, registerRoutes ) => {
	saveOauthFlags();
	utils();

	const { queryClient, unsubscribePersister } = await createQueryClient( currentUser?.ID );
	const initialQueryState = getInitialQueryState();
	hydrateServerState( queryClient, initialQueryState );

	const initialState = getInitialState( initialReducer, currentUser?.ID );
	const reduxStore = createReduxStore( initialState, initialReducer );
	setStore( reduxStore, getStateFromCache( currentUser?.ID ) );
	onDisablePersistence( persistOnChange( reduxStore, currentUser?.ID ) );
	onDisablePersistence( unsubscribePersister );
	setupLocale( currentUser, reduxStore );
	geolocateCurrencySymbol();
	configureReduxStore( currentUser, reduxStore );
	setupMiddlewares( currentUser, reduxStore, queryClient );
	detectHistoryNavigation.start();
	if ( registerRoutes ) {
		registerRoutes();
	}

	// Render initial `<Layout>` for non-isomorphic sections.
	// Isomorphic sections will take care of rendering their `<Layout>` themselves.
	if ( ! document.getElementById( 'primary' ) ) {
		renderLayout( reduxStore, queryClient );
	}

	page.start();
};

export const bootApp = async ( appName, registerRoutes ) => {
	const user = await initializeCurrentUser();
	debug( `Starting ${ appName }. Let's do this.` );
	await boot( user, registerRoutes );
};
