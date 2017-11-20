/** @format */

/**
 * External dependencies
 */

import { startsWith } from 'lodash';
import React from 'react';
import ReactDom from 'react-dom';
import store from 'store';
import page from 'page';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import config from 'config';
import { getSavedVariations } from 'lib/abtest'; // used by error logger
import { initConnection as initHappychatConnection } from 'state/happychat/connection/actions';
import { getHappychatAuth } from 'state/happychat/utils';
import wasHappychatRecentlyActive from 'state/happychat/selectors/was-happychat-recently-active';
import analytics from 'lib/analytics';
import { setReduxStore as setReduxBridgeReduxStore } from 'lib/redux-bridge';
import route from 'lib/route';
import normalize from 'lib/route/normalize';
import { isLegacyRoute } from 'lib/route/legacy-routes';
import superProps from 'lib/analytics/super-props';
import translatorJumpstart from 'lib/translator-jumpstart';
import nuxWelcome from 'layout/nux-welcome';
import emailVerification from 'components/email-verification';
import viewport from 'lib/viewport';
import { init as pushNotificationsInit } from 'state/push-notifications/actions';
import { pruneStaleRecords } from 'lib/wp/sync-handler';
import { setReduxStore as setSupportUserReduxStore } from 'lib/user/support-user-interop';
import { getSelectedSiteId, getSectionName } from 'state/ui/selectors';
import { setNextLayoutFocus, activateNextLayoutFocus } from 'state/ui/layout-focus/actions';

const debug = debugFactory( 'calypso' );

function renderLayout( reduxStore ) {
	const Layout = require( 'controller' ).ReduxWrappedLayout;

	const layoutElement = React.createElement( Layout, {
		store: reduxStore,
	} );

	ReactDom.render( layoutElement, document.getElementById( 'wpcom' ) );

	debug( 'Main layout rendered.' );
}

export function utils() {
	debug( 'Executing WordPress.com utils.' );

	// prune sync-handler records more than two days old
	pruneStaleRecords( '2 days' );

	translatorJumpstart.init();
}

export const configureReduxStore = ( currentUser, reduxStore ) => {
	debug( 'Executing WordPress.com configure Redux store.' );

	setSupportUserReduxStore( reduxStore );
	setReduxBridgeReduxStore( reduxStore );

	if ( currentUser.get() ) {
		if ( config.isEnabled( 'push-notifications' ) ) {
			// If the browser is capable, registers a service worker & exposes the API
			reduxStore.dispatch( pushNotificationsInit() );
		}
	}
};

export function setupMiddlewares( currentUser, reduxStore ) {
	debug( 'Executing WordPress.com setup middlewares.' );

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
			const Logger = require( 'lib/catch-js-errors' );
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
					context.canonicalPath.replace( route.getSiteFragment( context.canonicalPath ), ':siteId' )
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

		// If `?welcome` is present, and `?tour` isn't, show the welcome message
		if (
			! context.query.tour &&
			context.querystring === 'welcome' &&
			context.pathname.indexOf( '/me/next' ) === -1
		) {
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

	// delete any lingering local storage data from signup
	if ( ! startsWith( window.location.pathname, '/start' ) ) {
		[ 'signupProgress', 'signupDependencies' ].forEach( store.remove );
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

	require( 'my-sites' )();

	if ( currentUser.get() && config.isEnabled( 'olark' ) ) {
		asyncRequire( 'lib/olark', olark => olark.initialize( reduxStore.dispatch ) );
	}

	const state = reduxStore.getState();
	if ( wasHappychatRecentlyActive( state ) ) {
		reduxStore.dispatch( initHappychatConnection( getHappychatAuth( state )() ) );
	}

	if ( config.isEnabled( 'keyboard-shortcuts' ) ) {
		require( 'lib/keyboard-shortcuts/global' )();
	}

	if ( config.isEnabled( 'desktop' ) ) {
		require( 'lib/desktop' ).init();
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
}
