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

/**
 * Internal dependencies
 */
import * as controller from 'controller/index.web';
import { default as loginRouteSetter } from 'login';

// Store stuff:
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { combineReducers } from 'state/utils';
import { setupContextMiddleware } from './page-context-middleware';

// Middlewares:
import { default as wpcomApiMiddleware } from 'state/data-layer/wpcom-api-middleware';
import { analyticsMiddleware } from 'state/analytics/middleware';

// Reducers:
import analyticsTracking from 'state/analytics/reducer';
import oauth2Clients from 'state/oauth2-clients/reducer';
import login from 'state/login/reducer';
import ui from 'state/ui/reducer';
import documentHead from 'state/document-head/reducer';
import notices from 'state/notices/reducer';

const debug = debugFactory( 'calypso' );

const createCalypsoMinimalStore = () => {
	const rootReducer = combineReducers( {
		analyticsTracking,
		oauth2Clients,
		login,
		ui,
		documentHead,
		notices,
	} );
	const store = applyMiddleware( thunkMiddleware, wpcomApiMiddleware, analyticsMiddleware )( createStore )( rootReducer, {} );

	return store;
};

const boot = () => {
	debug( 'Starting logged out calypso build' );

	// setup routing:
	setupContextMiddleware( createCalypsoMinimalStore() ); // sets store to page's context
	loginRouteSetter( controller.clientRouter ); // sets login routes on the actual router ( page for client )
	page.start( { decodeURLComponents: false } );
};

window.AppBoot = boot;
