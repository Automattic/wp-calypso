/**
 * External dependencies
 */
import thunkMiddleware from 'redux-thunk';
import { createStore, applyMiddleware, combineReducers, compose } from 'redux';

/**
 * Internal dependencies
 */
import application from './application/reducer';
import comments from './comments/reducer';
import currentUser from './current-user/reducer';
import documentHead from './document-head/reducer';
import domains from './domains/reducer';
import googleAppsUsers from './google-apps-users/reducer';
import jetpackConnect from './jetpack-connect/reducer';
import notices from './notices/reducer';
import plans from './plans/reducer';
import preview from './preview/reducer';
import posts from './posts/reducer';
import plugins from './plugins/reducer';
import postTypes from './post-types/reducer';
import reader from './reader/reducer';
import receipts from './receipts/reducer';
import sharing from './sharing/reducer';
import sites from './sites/reducer';
import siteSettings from './site-settings/reducer';
import stats from './stats/reducer';
import support from './support/reducer';
import themes from './themes/reducer';
import ui from './ui/reducer';
import users from './users/reducer';

/**
 * Module variables
 */
export const reducer = combineReducers( {
	application,
	comments,
	currentUser,
	documentHead,
	domains,
	googleAppsUsers,
	jetpackConnect,
	notices,
	plugins,
	plans,
	preview,
	posts,
	postTypes,
	reader,
	receipts,
	sharing,
	sites,
	siteSettings,
	stats,
	support,
	themes,
	ui,
	users
} );

let middleware = [ thunkMiddleware ];

// Analytics middleware currently only works in the browser
if ( typeof window === 'object' ) {
	middleware = [
		...middleware,
		require( './analytics/middleware.js' ).analyticsMiddleware
	];
}

let createStoreWithMiddleware = applyMiddleware.apply( null, middleware );

export function createReduxStore( initialState = {} ) {
	if (
		typeof window === 'object' &&
		window.app &&
		window.app.isDebug &&
		window.devToolsExtension
	) {
		createStoreWithMiddleware = compose( createStoreWithMiddleware, window.devToolsExtension() );
	}
	return createStoreWithMiddleware( createStore )( reducer, initialState );
}
