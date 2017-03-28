/**
 * External dependencies
 */
const React = require( 'react' ),
	ReactDom = require( 'react-dom' ),
	store = require( 'store' ),
	some = require( 'lodash/some' ),
	startsWith = require( 'lodash/startsWith' ),
	debug = require( 'debug' )( 'calypso' ),
	page = require( 'page' ),
	includes = require( 'lodash/includes' );

/**
 * Internal dependencies
 */
const config = require( 'config' ),
	abtestModule = require( 'lib/abtest' ), // used by error logger
	getSavedVariations = abtestModule.getSavedVariations, // used by logger
	analytics = require( 'lib/analytics' ),
	route = require( 'lib/route' ),
	normalize = require( 'lib/route/normalize' ),
	{ isLegacyRoute } = require( 'lib/route/legacy-routes' ),
	sitesFactory = require( 'lib/sites-list' ),
	superProps = require( 'lib/analytics/super-props' ),
	translatorJumpstart = require( 'lib/translator-jumpstart' ),
	nuxWelcome = require( 'layout/nux-welcome' ),
	emailVerification = require( 'components/email-verification' ),
	viewport = require( 'lib/viewport' ),
	pushNotificationsInit = require( 'state/push-notifications/actions' ).init,
	setRouteAction = require( 'state/ui/actions' ).setRoute,
	syncHandler = require( 'lib/wp/sync-handler' ),
	supportUser = require( 'lib/user/support-user-interop' );

import { getSelectedSiteId, getSectionName } from 'state/ui/selectors';
import { setNextLayoutFocus, activateNextLayoutFocus } from 'state/ui/layout-focus/actions';

export function utils() {
	debug( 'Executing WordPress.com utils.' );

	// prune sync-handler records more than two days old
	syncHandler.pruneStaleRecords( '2 days' );

	translatorJumpstart.init();
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

export function setupMiddlewares( currentUser, reduxStore ) {
	debug( 'Executing WordPress.com setup middlewares.' );

	let layoutSection, validSections = [];

	supportUser.setReduxStore( reduxStore );

	// LOGGED IN
	if ( currentUser.get() ) {
		// When logged in the analytics module requires user and superProps objects
		// Inject these here
		analytics.initialize( currentUser, superProps ); // GENERIC hopefully, probably not

		if ( config.isEnabled( 'push-notifications' ) ) {
			// If the browser is capable, registers a service worker & exposes the API
			reduxStore.dispatch( pushNotificationsInit() );
		}
	} else {
		analytics.setSuperProps( superProps );
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
				user_id: currentUser.get().ID,
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
	page( '*', function( context, next ) { // FACTOR INTO ONE MIDDLEWARE
		if ( [ 'sb', 'sp' ].indexOf( context.querystring ) !== -1 ) {
			layoutSection = ( context.querystring === 'sb' ) ? 'sidebar' : 'sites';
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

	// warn against navigating from changed, unsaved forms
	page.exit( '*', require( 'lib/protect-form' ).checkFormHandler ); // GENERIC

	page( '*', function( context, next ) {
		const path = context.pathname;

		// Bypass this global handler for legacy routes
		// to avoid bumping stats and changing focus to the content
		if ( isLegacyRoute( path ) ) {
			return next();
		}

		// Focus UI on the content on page navigation
		if ( ! config.isEnabled( 'code-splitting' ) ) { // GENERIC
			context.store.dispatch( activateNextLayoutFocus() );
		}

		// NOT USED
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
		if ( '/me/account' !== context.path && currentUser.get().phone_account ) {
			page( '/me/account' );
		}

		next();
	} );

	page( '*', emailVerification );

	if ( config.isEnabled( 'oauth' ) ) { // GENERIC
		// Forces OAuth users to the /login page if no token is present
		page( '*', require( 'auth/controller' ).checkToken );
	}

	// Load the application modules for the various sections and features
	const sections = require( 'sections' ); // GENERIC
	sections.load(); // GENERIC

	// delete any lingering local storage data from signup
	if ( ! startsWith( window.location.pathname, '/start' ) ) {
		[ 'signupProgress', 'signupDependencies' ].forEach( store.remove );
	}

	validSections = sections.get().reduce( function( acc, section ) {
		return section.enableLoggedOut ? acc.concat( section.paths ) : acc;
	}, [] ); // GENERIC

	if ( ! currentUser.get() ) {
		// Dead-end the sections the user can't access when logged out
		page( '*', function( context, next ) { // GENERIC, FACTOR OUT EVIL
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
	} ); // GENERIC

	// clear notices
	//TODO: remove this one when notices are reduxified - it is for old notices // MOVE
	page( '*', require( 'notices' ).clearNoticesOnNavigation );

	if ( config.isEnabled( 'olark' ) ) {
		asyncRequire( 'lib/olark', olark => olark.initialize( reduxStore.dispatch ) );
	}

	if ( config.isEnabled( 'keyboard-shortcuts' ) ) {
		require( 'lib/keyboard-shortcuts/global' )( sitesFactory() );
	}

	if ( config.isEnabled( 'desktop' ) ) {
		require( 'lib/desktop' ).init(); // COULD BE GENERIC, LIKELY NOT
	}

	if ( config.isEnabled( 'rubberband-scroll-disable' ) ) {
		asyncRequire( 'lib/rubberband-scroll-disable', ( disableRubberbandScroll ) => {
			disableRubberbandScroll( document.body );
		} );
	}

	if ( config.isEnabled( 'dev/test-helper' ) && document.querySelector( '.environment.is-tests' ) ) {
		asyncRequire( 'lib/abtest/test-helper', ( testHelper ) => {
			testHelper( document.querySelector( '.environment.is-tests' ) );
		} );
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
}
