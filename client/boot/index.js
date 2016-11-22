// Initialize localStorage polyfill before any dependencies are loaded
require( 'lib/local-storage' )();
if ( process.env.NODE_ENV === 'development' ) {
	require( 'lib/wrap-es6-functions' )();
}

/**
 * External dependencies
 */
var React = require( 'react' ),
	ReactDom = require( 'react-dom' ),
	store = require( 'store' ),
	ReactClass = require( 'react/lib/ReactClass' ),
	some = require( 'lodash/some' ),
	startsWith = require( 'lodash/startsWith' ),
	debug = require( 'debug' )( 'calypso' ),
	page = require( 'page' ),
	url = require( 'url' ),
	qs = require( 'querystring' ),
	injectTapEventPlugin = require( 'react-tap-event-plugin' ),
	i18n = require( 'i18n-calypso' ),
	includes = require( 'lodash/includes' );

/**
 * Internal dependencies
 */
// lib/local-storage must be run before lib/user
var config = require( 'config' ),
	abtestModule = require( 'lib/abtest' ),
	getSavedVariations = abtestModule.getSavedVariations,
	switchLocale = require( 'lib/i18n-utils/switch-locale' ),
	analytics = require( 'lib/analytics' ),
	route = require( 'lib/route' ),
	normalize = require( 'lib/route/normalize' ),
	{ isLegacyRoute } = require( 'lib/route/legacy-routes' ),
	user = require( 'lib/user' )(),
	receiveUser = require( 'state/users/actions' ).receiveUser,
	setCurrentUserId = require( 'state/current-user/actions' ).setCurrentUserId,
	setCurrentUserFlags = require( 'state/current-user/actions' ).setCurrentUserFlags,
	sites = require( 'lib/sites-list' )(),
	superProps = require( 'lib/analytics/super-props' ),
	translatorJumpstart = require( 'lib/translator-jumpstart' ),
	nuxWelcome = require( 'layout/nux-welcome' ),
	emailVerification = require( 'components/email-verification' ),
	viewport = require( 'lib/viewport' ),
	detectHistoryNavigation = require( 'lib/detect-history-navigation' ),
	pushNotificationsInit = require( 'state/push-notifications/actions' ).init,
	touchDetect = require( 'lib/touch-detect' ),
	setRouteAction = require( 'state/ui/actions' ).setRoute,
	accessibleFocus = require( 'lib/accessible-focus' ),
	syncHandler = require( 'lib/wp/sync-handler' ),
	bindWpLocaleState = require( 'lib/wp/localization' ).bindState,
	supportUser = require( 'lib/user/support-user-interop' ),
	createReduxStoreFromPersistedInitialState = require( 'state/initial-state' ).default;

import { getSelectedSiteId, getSectionName } from 'state/ui/selectors';
import { setNextLayoutFocus, activateNextLayoutFocus } from 'state/ui/layout-focus/actions';

function init() {
	var i18nLocaleStringsObject = null;

	debug( 'Starting Calypso. Let\'s do this.' );

	// prune sync-handler records more than two days old
	syncHandler.pruneStaleRecords( '2 days' );

	// Initialize i18n
	if ( window.i18nLocaleStrings ) {
		i18nLocaleStringsObject = JSON.parse( window.i18nLocaleStrings );
		i18n.setLocale( i18nLocaleStringsObject );
	}

	ReactClass.injection.injectMixin( i18n.mixin );

	// Infer touch screen by checking if device supports touch events
	// See touch-detect/README.md
	if ( touchDetect.hasTouch() ) {
		document.documentElement.classList.add( 'touch' );
	} else {
		document.documentElement.classList.add( 'notouch' );
	}

	// Initialize touch
	injectTapEventPlugin();

	// Add accessible-focus listener
	accessibleFocus();
}

function setUpContext( reduxStore ) {
	page( '*', function( context, next ) {
		var parsed = url.parse( location.href, true );

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

function loadDevModulesAndBoot() {
	if ( process.env.NODE_ENV === 'development' && config.isEnabled( 'render-visualizer' ) ) {
		// Use Webpack's code splitting feature to put the render visualizer in a separate fragment.
		// This way it won't get downloaded unless this feature is enabled.
		// Since loading this fragment is asynchronous and we need to inject this mixin into all React classes,
		// we have to wait for it to load before proceeding with the application's startup.
		require.ensure( [], function() {
			ReactClass.injection.injectMixin( require( 'lib/mixins/render-visualizer' ) );
			boot();
		}, 'devmodules' );

		return;
	}

	boot();
}

function boot() {
	var localeSlug;

	init();

	// When the user is bootstrapped, we also bootstrap the
	// locale strings
	if ( ! config( 'wpcom_user_bootstrap' ) ) {
		localeSlug = user.get().localeSlug;
		if ( localeSlug ) {
			switchLocale( localeSlug );
		}
	}
	// Set the locale for the current user
	user.on( 'change', function() {
		localeSlug = user.get().localeSlug;
		if ( localeSlug ) {
			switchLocale( localeSlug );
		}
	} );

	translatorJumpstart.init();

	createReduxStoreFromPersistedInitialState( reduxStoreReady );
}

function renderLayout( reduxStore ) {
	const Layout = require( 'controller' ).ReduxWrappedLayout;

	const layoutElement = React.createElement( Layout, {
		store: reduxStore
	} );

	ReactDom.render(
		layoutElement,
		document.getElementById( 'wpcom' )
	);

	debug( 'Main layout rendered.' );
}

function reduxStoreReady( reduxStore ) {
	let layoutSection, validSections = [];

	bindWpLocaleState( reduxStore );

	supportUser.setReduxStore( reduxStore );

	if ( user.get() ) {
		// When logged in the analytics module requires user and superProps objects
		// Inject these here
		analytics.initialize( user, superProps );

		// Set current user in Redux store
		reduxStore.dispatch( receiveUser( user.get() ) );
		reduxStore.dispatch( setCurrentUserId( user.get().ID ) );
		reduxStore.dispatch( setCurrentUserFlags( user.get().meta.data.flags.active_flags ) );

		if ( config.isEnabled( 'push-notifications' ) ) {
			// If the browser is capable, registers a service worker & exposes the API
			reduxStore.dispatch( pushNotificationsInit() );
		}
	} else {
		analytics.setSuperProps( superProps );
	}

	if ( config.isEnabled( 'network-connection' ) ) {
		require( 'lib/network-connection' ).init( reduxStore );
	}

	if ( config.isEnabled( 'css-hot-reload' ) ) {
		require( 'lib/css-hot-reload' )();
	}

	// Render Layout only for non-isomorphic sections.
	// Isomorphic sections will take care of rendering their Layout last themselves.
	if ( ! document.getElementById( 'primary' ) ) {
		renderLayout( reduxStore );

		if ( config.isEnabled( 'catch-js-errors' ) ) {
			const Logger = require( 'lib/catch-js-errors' );
			const errorLogger = new Logger();
			//Save errorLogger to a singleton for use in arbitrary logging.
			require( 'lib/catch-js-errors/log' ).registerLogger( errorLogger );
			//Save data to JS error logger
			errorLogger.saveDiagnosticData( {
				user_id: user.get().ID,
				calypso_env: config( 'env_id' )
			} );
			errorLogger.saveDiagnosticReducer( function() {
				const state = reduxStore.getState();
				return {
					blog_id: getSelectedSiteId( state ),
					calypso_section: getSectionName( state )
				};
			} );
			errorLogger.saveDiagnosticReducer( () => ( { tests: getSavedVariations() } ) );
			analytics.on( 'record-event', ( eventName, eventProperties ) => errorLogger.saveExtraData( { lastTracksEvent: eventProperties } ) );
			page( '*', function( context, next ) {
				errorLogger.saveNewPath( context.canonicalPath.replace( route.getSiteFragment( context.canonicalPath ), ':siteId' ) );
				next();
			} );
		}
	}

	// If `?sb` or `?sp` are present on the path set the focus of layout
	// This can be removed when the legacy version is retired.
	page( '*', function( context, next ) {
		if ( [ 'sb', 'sp' ].indexOf( context.querystring ) !== -1 ) {
			layoutSection = ( context.querystring === 'sb' ) ? 'sidebar' : 'sites';
			reduxStore.dispatch( setNextLayoutFocus( layoutSection ) );
			page.replace( context.pathname );
		}

		next();
	} );

	setUpContext( reduxStore );

	page( '*', function( context, next ) {
		// Don't normalize legacy routes - let them fall through and be unhandled
		// so that page redirects away from Calypso
		if ( isLegacyRoute( context.pathname ) ) {
			return next();
		}

		return normalize( context, next );
	} );

	// warn against navigating from changed, unsaved forms
	page.exit( '*', require( 'lib/protect-form' ).checkFormHandler );

	page( '*', function( context, next ) {
		var path = context.pathname;

		// Bypass this global handler for legacy routes
		// to avoid bumping stats and changing focus to the content
		if ( isLegacyRoute( path ) ) {
			return next();
		}

		// Focus UI on the content on page navigation
		if ( ! config.isEnabled( 'code-splitting' ) ) {
			context.store.dispatch( activateNextLayoutFocus() );
		}

		// If `?welcome` is present, and `?tour` isn't, show the welcome message
		if ( ! context.query.tour && context.querystring === 'welcome' && context.pathname.indexOf( '/me/next' ) === -1 ) {
			// show welcome message, persistent for full sized screens
			nuxWelcome.setWelcome( viewport.isDesktop() );
		} else {
			nuxWelcome.clearTempWelcome();
		}

		// Bump general stat tracking overall Newdash usage
		analytics.mc.bumpStat( { newdash_pageviews: 'route' } );

		next();
	} );

	page( '*', function( context, next ) {
		if ( '/me/account' !== context.path && user.get().phone_account ) {
			page( '/me/account' );
		}

		next();
	} );

	page( '*', emailVerification );

	if ( config.isEnabled( 'oauth' ) ) {
		// Forces OAuth users to the /login page if no token is present
		page( '*', require( 'auth/controller' ).checkToken );
	}

	// Load the application modules for the various sections and features
	const sections = require( 'sections' );
	sections.load();

	// delete any lingering local storage data from signup
	if ( ! startsWith( window.location.pathname, '/start' ) ) {
		[ 'signupProgress', 'signupDependencies' ].forEach( store.remove );
	}

	validSections = sections.get().reduce( function( acc, section ) {
		return section.enableLoggedOut ? acc.concat( section.paths ) : acc;
	}, [] );

	if ( ! user.get() ) {
		// Dead-end the sections the user can't access when logged out
		page( '*', function( context, next ) {
			const isValidSection = some( validSections, function( validPath ) {
				return startsWith( context.path, validPath );
			} );

			if ( '/' === context.pathname && config.isEnabled( 'devdocs/redirect-loggedout-homepage' ) ) {
				if ( config.isEnabled( 'oauth' ) ) {
					page.redirect( '/authorize' );
				} else {
					page.redirect( '/devdocs/start' );
				}
				return;
			}

			//see server/pages/index for prod redirect
			if ( '/plans' === context.pathname ) {
				const queryFor = context.query && context.query.for;
				if ( queryFor && 'jetpack' === queryFor ) {
					window.location = 'https://wordpress.com/wp-login.php?redirect_to=https%3A%2F%2Fwordpress.com%2Fplans';
				} else {
					// pricing page is outside of Calypso, needs a full page load
					window.location = 'https://wordpress.com/pricing';
				}
				return;
			}

			if ( isValidSection ) {
				next();
			}
		} );
	}

	require( 'my-sites' )();

	// clear notices
	page( '*', function( context, next ) {
		context.store.dispatch( setRouteAction(
					context.pathname,
					context.query ) );
		next();
	} );

	// clear notices
	//TODO: remove this one when notices are reduxified - it is for old notices
	page( '*', require( 'notices' ).clearNoticesOnNavigation );

	if ( config.isEnabled( 'olark' ) ) {
		require( 'lib/olark' ).initialize( reduxStore.dispatch );
	}

	if ( config.isEnabled( 'keyboard-shortcuts' ) ) {
		require( 'lib/keyboard-shortcuts/global' )( sites );
	}

	if ( config.isEnabled( 'desktop' ) ) {
		require( 'lib/desktop' ).init();
	}

	if ( config.isEnabled( 'rubberband-scroll-disable' ) ) {
		require( 'lib/rubberband-scroll-disable' )( document.body );
	}

	if ( config.isEnabled( 'dev/test-helper' ) && document.querySelector( '.environment.is-tests' ) ) {
		require( 'lib/abtest/test-helper' )( document.querySelector( '.environment.is-tests' ) );
	}

	/*
	 * Layouts with differing React mount-points will not reconcile correctly,
	 * so remove an existing single-tree layout by re-rendering if necessary.
	 *
	 * TODO (@seear): Converting all of Calypso to single-tree layout will
	 * make this unnecessary.
	 */
	page( '*', function( context, next ) {
		const previousLayoutIsSingleTree = !! (
			document.getElementsByClassName( 'wp-singletree-layout' ).length
		);

		const singleTreeSections = [ 'theme', 'themes' ];
		const sectionName = getSectionName( context.store.getState() );
		const isMultiTreeLayout = ! includes( singleTreeSections, sectionName );

		if ( isMultiTreeLayout && previousLayoutIsSingleTree ) {
			debug( 'Re-rendering multi-tree layout' );

			renderLayout( context.store );
		} else if ( ! isMultiTreeLayout && ! previousLayoutIsSingleTree ) {
			debug( 'Unmounting multi-tree layout' );
			ReactDom.unmountComponentAtNode( document.getElementById( 'primary' ) );
			ReactDom.unmountComponentAtNode( document.getElementById( 'secondary' ) );
		}
		next();
	} );

	detectHistoryNavigation.start();
	page.start();
}

window.AppBoot = function() {
	if ( user.initialized ) {
		loadDevModulesAndBoot();
	} else {
		user.once( 'change', function() {
			loadDevModulesAndBoot();
		} );
	}
};
