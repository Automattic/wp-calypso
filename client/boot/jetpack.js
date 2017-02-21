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
	startsWith = require( 'lodash/startsWith' ),
	debug = require( 'debug' )( 'calypso' ),
	page = require( 'page' ),
	url = require( 'url' ),
	qs = require( 'querystring' ),
	i18n = require( 'i18n-calypso' ),
	includes = require( 'lodash/includes' );

/**
 * Internal dependencies
 */
// lib/local-storage must be run before lib/user
var config = require( 'config' ),
	normalize = require( 'lib/route/normalize' ),
	{ isLegacyRoute } = require( 'lib/route/legacy-routes' ),
	detectHistoryNavigation = require( 'lib/detect-history-navigation' ),
	touchDetect = require( 'lib/touch-detect' ),
	setRouteAction = require( 'state/ui/actions' ).setRoute,
	accessibleFocus = require( 'lib/accessible-focus' ),
	createReduxStoreFromPersistedInitialState = require( 'state/initial-state' ).default;

import { getSectionName } from 'state/ui/selectors';
import { activateNextLayoutFocus } from 'state/ui/layout-focus/actions';

function init() {
	var i18nLocaleStringsObject = null;

	debug( 'Starting Jetpack-Calypso. Let\'s do this.' );

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
	init();
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
	}

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

		next();
	} );

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

	if ( config.isEnabled( 'desktop' ) ) {
		require( 'lib/desktop' ).init();
	}

	if ( config.isEnabled( 'rubberband-scroll-disable' ) ) {
		require( 'lib/rubberband-scroll-disable' )( document.body );
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
			ReactDom.unmountComponentAtNode( document.getElementById( 'wpcom' ) );
			renderLayout( context.store );
		} else if ( ! isMultiTreeLayout && ! previousLayoutIsSingleTree ) {
			debug( 'Unmounting multi-tree layout' );
			ReactDom.unmountComponentAtNode( document.getElementById( 'primary' ) );
			ReactDom.unmountComponentAtNode( document.getElementById( 'secondary' ) );
		}
		next();
	} );

	detectHistoryNavigation.start();

	page.start( {
		hashbang: true,
		decodeURLComponents: false,
	} );
	page.base( '/wp-admin/options-general.php' );
}

window.AppBoot = function() {
	loadDevModulesAndBoot();
};
