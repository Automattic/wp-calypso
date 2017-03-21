// Initialize localStorage polyfill before any dependencies are loaded
require( 'lib/local-storage' )(); // GENERIC
if ( process.env.NODE_ENV === 'development' ) {
	require( 'lib/wrap-es6-functions' )(); // GENERIC
}

import config

import state
import i18n

export function boot( currentUser ) {
	locales( currentUser );
	reduxState( currentUser, ( store ) => setupContext( store ) );
	setupMiddleware( currentUser );
	loadSections();
	require( config( 'project' ) ).boot( currentUser );
	page( '*', project.middlewares )
}

function locales( currentUser ) {
	// Initialize i18n
	ReactClass.injection.injectMixin( i18n.mixin ); // ← :( NO TODO REMOVE THIS
	if ( window.i18nLocaleStrings ) {
		i18nLocaleStringsObject = JSON.parse( window.i18nLocaleStrings );
		i18n.setLocale( i18nLocaleStringsObject );
	}
}

function setupMiddleware() {
}

function setupUtils() {
	// Infer touch screen by checking if device supports touch events
	// See touch-detect/README.md
	if ( touchDetect.hasTouch() ) {
		document.documentElement.classList.add( 'touch' );
	} else {
		document.documentElement.classList.add( 'notouch' );
	} // GENERIC

	// Add accessible-focus listener
	accessibleFocus(); // GENERIC
}

function setUpContext( reduxStore ) {
	page( '*', function( context, next ) {
		var parsed = url.parse( location.href, true );

		context.store = reduxStore; // GENERIC

		// Break routing and do full page load for logout link in /me
		if ( context.pathname === '/wp-login.php' ) {
			window.location.href = context.path;
			return;
		}

		// set `context.query` GENERIC
		const querystringStart = context.canonicalPath.indexOf( '?' );
		if ( querystringStart !== -1 ) {
			context.query = qs.parse( context.canonicalPath.substring( querystringStart + 1 ) );
		} else {
			context.query = {};
		}

		context.prevPath = parsed.path === context.path ? false : parsed.path;

		// set `context.hash` (we have to parse manually) // GENERIC
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

// GENERIC
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

// onLoggedIn()
// onLoggedOut()
// setProject( config( 'project' ) ) -> RENDER
// fallbackRender( start a project error )
