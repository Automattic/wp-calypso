/**
 * External dependencies
 */
import thunkMiddleware from 'redux-thunk';
import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import { router5Middleware, router5Reducer } from 'redux-router5';

/**
 * Internal dependencies
 */
import application from './application/reducer';
import notices from './notices/reducer';
import posts from './posts/reducer';
import plugins from './plugins/reducer';
import sharing from './sharing/reducer';
import sites from './sites/reducer';
import siteSettings from './site-settings/reducer';
import support from './support/reducer';
import themes from './themes/reducer';
import users from './users/reducer';
import currentUser from './current-user/reducer';
import ui from './ui/reducer';

/**
 * Module variables
 */
export const reducer = combineReducers( {
	router: router5Reducer,
	plugins,
	application,
	notices,
	posts,
	sharing,
	sites,
	siteSettings,
	support,
	themes,
	users,
	currentUser,
	ui
} );

let middleware = [ thunkMiddleware ];

// Analytics middleware currently only works in the browser
if ( typeof window === 'object' ) {
	middleware = [
		...middleware,
		require( './themes/middlewares.js' ).analyticsMiddleware
	];
}

export function createReduxStore( initialState = {}, router ) {
	console.log( router );
	middleware = [ router5Middleware( router ), ...middleware ];
	let createStoreWithMiddleware = applyMiddleware.apply( null, middleware );
	return createStoreWithMiddleware( createStore )( reducer, initialState );
}
