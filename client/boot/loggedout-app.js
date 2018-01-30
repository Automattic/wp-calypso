/** @format */
// Initialize polyfills before any dependencies are loaded
import './polyfills';

if ( process.env.NODE_ENV === 'development' ) {
	require( 'lib/wrap-es6-functions' ).default();
}

/**
 * External dependencies
 */
// import { invoke } from 'lodash';
import debugFactory from 'debug';
import page from 'page';
import url from 'url';
import qs from 'querystring';
import { createStore } from 'redux';

/**
 * Internal dependencies
 */
// import { configureReduxStore, locales, setupMiddlewares, utils } from './common';
// import createReduxStoreFromPersistedInitialState from 'state/initial-state';
// import detectHistoryNavigation from 'lib/detect-history-navigation';
// import userFactory from 'lib/user';
import * as controller from 'controller/index.web';
import login from 'login';
import { combineReducers } from 'state/utils';
import oauth2Clients from 'state/oauth2-clients/reducer';
import ui from 'state/ui/reducer';

const debug = debugFactory( 'calypso' );


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
				context.hash = qs.parse( context.hashstring );
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
};

const boot = () => {
	debug( "Starting Calypso. Let's do this." );

	const store = createStore( combineReducers( [ oauth2Clients, ui ] ), {} );
	setupContextMiddleware( store );
	login( controller.clientRouter );
	page.start( { decodeURLComponents: false } );
	
	// const project = require( `./project/${ PROJECT_NAME }` );
	// utils();
	// invoke( project, 'utils' );
	//createReduxStoreFromPersistedInitialState( reduxStore => {
		// locales( currentUser, reduxStore );
		// invoke( project, 'locales', currentUser, reduxStore );
		// configureReduxStore( currentUser, reduxStore );
		// invoke( project, 'configureReduxStore', currentUser, reduxStore );
		// setupMiddlewares( currentUser, reduxStore );
		// invoke( project, 'setupMiddlewares', currentUser, reduxStore );
		// detectHistoryNavigation.start();
		// page.start( { decodeURLComponents: false } );
	//} );
};

window.AppBoot = () => {
	boot();
	// const user = userFactory();
	// if ( user.initialized ) {
	// 	boot( user );
	// } else {
	// 	user.once( 'change', () => boot( user ) );
	// }
};
