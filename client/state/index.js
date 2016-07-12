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
import componentsUsageStats from './components-usage-stats/reducer';
import currentUser from './current-user/reducer';
import documentHead from './document-head/reducer';
import domains from './domains/reducer';
import firstView from './first-view/reducer';
import googleAppsUsers from './google-apps-users/reducer';
import jetpackConnect from './jetpack-connect/reducer';
import jetpackSync from './jetpack-sync/reducer';
import notices from './notices/reducer';
import plans from './plans/reducer';
import plugins from './plugins/reducer';
import posts from './posts/reducer';
import postTypes from './post-types/reducer';
import preferences from './preferences/reducer';
import preview from './preview/reducer';
import pushNotifications from './push-notifications/reducer';
import reader from './reader/reducer';
import receipts from './receipts/reducer';
import sharing from './sharing/reducer';
import sites from './sites/reducer';
import siteSettings from './site-settings/reducer';
import stats from './stats/reducer';
import storedCards from './stored-cards/reducer';
import support from './support/reducer';
import terms from './terms/reducer';
import themes from './themes/reducer';
import ui from './ui/reducer';
import users from './users/reducer';
import wordads from './wordads/reducer';

/**
 * Module variables
 */
export const reducer = combineReducers( {
	application,
	comments,
	componentsUsageStats,
	currentUser,
	documentHead,
	domains,
	firstView,
	googleAppsUsers,
	jetpackConnect,
	jetpackSync,
	notices,
	plugins,
	plans,
	preferences,
	preview,
	posts,
	postTypes,
	pushNotifications,
	reader,
	receipts,
	sharing,
	sites,
	siteSettings,
	stats,
	storedCards,
	support,
	terms,
	themes,
	ui,
	users,
	wordads
} );

let middleware = [ thunkMiddleware ];

// Analytics middleware currently only works in the browser
if ( typeof window === 'object' ) {
	middleware = [
		require( 'lib/screen-title' ).screenTitleMiddleware,
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
