/**
 * External dependencies
 */
var React = require( 'react' ),
	store = require( 'store' ),
	ReactInjection = require( 'react/lib/ReactInjection' ),
	some = require( 'lodash/some' ),
	startsWith = require( 'lodash/startsWith' ),
	classes = require( 'component-classes' ),
	debug = require( 'debug' )( 'calypso' ),
	page = require( 'page' ),
	url = require( 'url' ),
	Path = require( 'path-parser' ),
	qs = require( 'querystring' ),
	injectTapEventPlugin = require( 'react-tap-event-plugin' ),
	createReduxStoreFromPersistedInitialState = require( 'state/initial-state' ).default;

/**
 * Internal dependencies
 */
// lib/local-storage must be run before lib/user
var config = require( 'config' ),
	localStoragePolyfill = require( 'lib/local-storage' )(), //eslint-disable-line
	analytics = require( 'analytics' ),
	route = require( 'lib/route' ),
	user = require( 'lib/user' )(),
	receiveUser = require( 'state/users/actions' ).receiveUser,
	setCurrentUserId = require( 'state/current-user/actions' ).setCurrentUserId,
	sites = require( 'lib/sites-list' )(),
	superProps = require( 'analytics/super-props' ),
	i18n = require( 'lib/mixins/i18n' ),
	perfmon = require( 'lib/perfmon' ),
	translatorJumpstart = require( 'lib/translator-jumpstart' ),
	translatorInvitation = require( 'layout/community-translator/invitation-utils' ),
	layoutFocus = require( 'lib/layout-focus' ),
	nuxWelcome = require( 'nux-welcome' ),
	emailVerification = require( 'components/email-verification' ),
	viewport = require( 'lib/viewport' ),
	detectHistoryNavigation = require( 'lib/detect-history-navigation' ),
	sections = require( 'sections' ),
	touchDetect = require( 'lib/touch-detect' ),
	setRouteAction = require( 'state/notices/actions' ).setRoute,
	accessibleFocus = require( 'lib/accessible-focus' ),
	TitleStore = require( 'lib/screen-title/store' ),
	renderWithReduxStore = require( 'lib/react-helpers' ).renderWithReduxStore,
	bindWpLocaleState = require( 'lib/wp/localization' ).bindState,
	// The following components require the i18n mixin, so must be required after i18n is initialized
	Layout;

function init() {
	var i18nLocaleStringsObject = null;

	debug( 'Starting Calypso. Let\'s do this.' );

	// Initialize i18n
	if ( window.i18nLocaleStrings ) {
		i18nLocaleStringsObject = JSON.parse( window.i18nLocaleStrings );
	}
	i18n.initialize( i18nLocaleStringsObject );

	ReactInjection.Class.injectMixin( i18n.mixin );

	// Infer touch screen by checking if device supports touch events
	// See touch-detect/README.md
	if ( touchDetect.hasTouch() ) {
		classes( document.documentElement ).add( 'touch' );
	} else {
		classes( document.documentElement ).add( 'notouch' );
	}

	// Initialize touch
	injectTapEventPlugin();

	// Add accessible-focus listener
	accessibleFocus();

	// Set document title
	TitleStore.on( 'change', function() {
		var title = TitleStore.getState().formattedTitle;
		if ( title && title !== document.title ) {
			document.title = title;
		}
	} );
}

function setUpContext( layout, reduxStore ) {
	// Pass the layout so that it is available to all page handlers
	// and add query and hash objects onto context object
	page( '*', function( context, next ) {
		var parsed = url.parse( location.href, true );

		context.layout = layout;
		context.store = reduxStore;

		// Break routing and do full page load for logout link in /me
		if ( context.pathname === '/wp-login.php' ) {
			window.location.href = context.path;
			return;
		}

		// set `context.query`
		// debugger
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
	if ( config.isEnabled( 'render-visualizer' ) ) {
		// Use Webpack's code splitting feature to put the render visualizer in a separate fragment.
		// This way it won't get downloaded unless this feature is enabled.
		// Since loading this fragment is asynchronous and we need to inject this mixin into all React classes,
		// we have to wait for it to load before proceeding with the application's startup.
		require.ensure( [], function() {
			ReactInjection.Class.injectMixin( require( 'lib/mixins/render-visualizer' ) );
			boot();
		}, 'devmodules' );

		return;
	}

	boot();
}

function boot() {
	init();

	// When the user is bootstrapped, we also bootstrap the
	// locale strings
	if ( ! config( 'wpcom_user_bootstrap' ) ) {
		i18n.setLocaleSlug( user.get().localeSlug );
	}
	// Set the locale for the current user
	user.on( 'change', function() {
		i18n.setLocaleSlug( user.get().localeSlug );
	} );

	translatorJumpstart.init();

	createReduxStoreFromPersistedInitialState( reduxStoreReady );
}

function reduxStoreReady( reduxStore ) {
	let layoutSection, layout, layoutElement, validSections = [];

	bindWpLocaleState( reduxStore );

	// Is a support user token active?
	if ( config.isEnabled( 'support-user' ) ) {
		require( 'lib/user/support-user-interop' )( reduxStore );
		const supportUser = store.get( 'support_user' );
		const { supportUserTokenSet } = require( 'state/support/actions' );
		if ( supportUser && supportUser.user && supportUser.token ) {
			reduxStore.dispatch( supportUserTokenSet( supportUser.user, supportUser.token ) );
		}
	}

	Layout = require( 'layout' );

	if ( user.get() ) {
		// When logged in the analytics module requires user and superProps objects
		// Inject these here
		analytics.initialize( user, superProps );

		// Set current user in Redux store
		reduxStore.dispatch( receiveUser( user.get() ) );
		reduxStore.dispatch( setCurrentUserId( user.get().ID ) );

		// Create layout instance with current user prop
		layoutElement = React.createElement( Layout, {
			user: user,
			sites: sites,
			focus: layoutFocus,
			nuxWelcome: nuxWelcome,
			translatorInvitation: translatorInvitation
		} );
	} else {
		let props = {};
		analytics.setSuperProps( superProps );

		// TODO(ehg): Delete this mini-router when we have an isomorphic, single render tree routing solution
		if ( config.isEnabled( 'manage/themes/details' ) ) {
			const themesRoutes = [
				{ name: 'design', path: new Path( '/design' ) },
				{ name: 'themes', path: new Path( '/themes/:theme_slug' ) },
			];

			const matchedRoutes = themesRoutes
				.map( r => ( Object.assign( {}, r, { match: r.path.partialMatch( window.location.pathname ) } ) ) )
				.filter( r => r.match !== null );

			if ( matchedRoutes.length ) {
				props = { routeName: matchedRoutes[0].name, match: matchedRoutes[0].match };
				Layout = require( 'layout/logged-out-design' );
			}
		} else if ( startsWith( window.location.pathname, '/design' ) ) {
			Layout = require( 'layout/logged-out-design' );
		}

		layoutElement = React.createElement( Layout, Object.assign( {}, props, {
			focus: layoutFocus
		} ) );
	}

	if ( config.isEnabled( 'perfmon' ) ) {
		// Record time spent watching slowly-flashing divs
		perfmon();
	}

	if ( config.isEnabled( 'network-connection' ) ) {
		require( 'lib/network-connection' ).init( reduxStore );
	}

	layout = renderWithReduxStore(
		layoutElement,
		document.getElementById( 'wpcom' ),
		reduxStore
	);

	debug( 'Main layout rendered.' );

	// If `?sb` or `?sp` are present on the path set the focus of layout
	// This needs to be done before the page.js router is started and can be removed when the legacy version is retired
	if ( window && [ '?sb', '?sp' ].indexOf( window.location.search ) !== -1 ) {
		layoutSection = ( window.location.search === '?sb' ) ? 'sidebar' : 'sites';
		layoutFocus.set( layoutSection );
		window.history.replaceState( null, document.title, window.location.pathname );
	}

	setUpContext( layout, reduxStore );
	page( '*', require( 'lib/route/normalize' ) );

	// warn against navigating from changed, unsaved forms
	page( '*', require( 'lib/mixins/protect-form' ).checkFormHandler );

	page( '*', function( context, next ) {
		var path = context.pathname;

		// Bypass this global handler for legacy routes
		// to avoid bumping stats and changing focus to the content
		if ( /.php$/.test( path ) ||
				/^\/?$/.test( path ) && ! config.isEnabled( 'reader' ) ||
				/^\/my-stats/.test( path ) ||
				/^\/(post\b|page\b)/.test( path ) && ! config.isEnabled( 'post-editor' ) ||
				/^\/notifications/.test( path ) ||
				/^\/themes/.test( path ) ||
				/^\/manage/.test( path ) ||
				/^\/plans/.test( path ) && ! config.isEnabled( 'manage/plans' ) ||
				/^\/me/.test( path ) && ! /^\/me\/billing/.test( path ) &&
				! /^\/me\/next/.test( path ) && ! config.isEnabled( 'me/my-profile' ) ) {
			return next();
		}

		// Focus UI on the content on page navigation
		if ( ! config.isEnabled( 'code-splitting' ) ) {
			layoutFocus.next();
		}

		// If `?welcome` is present show the welcome message
		if ( context.querystring === 'welcome' && context.pathname.indexOf( '/me/next' ) === -1 ) {
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

	page( '*', function( context, next ) {
		emailVerification.renderNotice( context );
		next();
	} );

	if ( config.isEnabled( 'oauth' ) ) {
		// Forces OAuth users to the /login page if no token is present
		page( '*', require( 'auth/controller' ).checkToken );
	}

	// Load the application modules for the various sections and features
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
			var isValidSection = some( validSections, function( validPath ) {
				return startsWith( context.path, validPath );
			} );

			if ( '/' === context.path && config.isEnabled( 'devdocs/redirect-loggedout-homepage' ) ) {
				page.redirect( '/devdocs/start' );
				return;
			}

			if ( isValidSection ) {
				next();
			}
		} );
	}

	page( '*', function( context, next ) {
		// Reset the selected site before each route is executed. This needs to
		// occur after the sections routes execute to avoid a brief flash where
		// sites are reset but the next section is waiting to be loaded.
		if ( ! route.getSiteFragment( context.path ) && sites.getSelectedSite() ) {
			sites.resetSelectedSite();
		}

		next();
	} );

	require( 'my-sites' )();

	// clear notices
	page( '*', function( context, next ) {
		context.store.dispatch( setRouteAction( context.pathname ) );
		next();
	} );

	// clear notices
	//TODO: remove this one when notices are reduxified - it is for old notices
	page( '*', require( 'notices' ).clearNoticesOnNavigation );

	if ( config.isEnabled( 'olark' ) ) {
		require( 'lib/olark' );
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
