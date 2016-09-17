/**
 * External dependencies
 */
import thunkMiddleware from 'redux-thunk';
import { createStore, applyMiddleware, combineReducers, compose } from 'redux';

/**
 * Internal dependencies
 */
import noticesMiddleware from './notices/middleware';
import application from './application/reducer';
import comments from './comments/reducer';
import componentsUsageStats from './components-usage-stats/reducer';
import countryStates from './country-states/reducer';
import currentUser from './current-user/reducer';
import documentHead from './document-head/reducer';
import domains from './domains/reducer';
import geo from './geo/reducer';
import googleAppsUsers from './google-apps-users/reducer';
import help from './help/reducer';
import jetpackConnect from './jetpack-connect/reducer';
import jetpackSync from './jetpack-sync/reducer';
import happychat from './happychat/reducer';
import notices from './notices/reducer';
import pageTemplates from './page-templates/reducer';
import plans from './plans/reducer';
import plugins from './plugins/reducer';
import postFormats from './post-formats/reducer';
import posts from './posts/reducer';
import postTypes from './post-types/reducer';
import preferences from './preferences/reducer';
import preview from './preview/reducer';
import productsList from './products-list/reducer';
import pushNotifications from './push-notifications/reducer';
import purchases from './purchases/reducer';
import reader from './reader/reducer';
import receipts from './receipts/reducer';
import sharing from './sharing/reducer';
import shortcodes from './shortcodes/reducer';
import signup from './signup/reducer';
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
	countryStates,
	currentUser,
	documentHead,
	domains,
	geo,
	googleAppsUsers,
	happychat,
	help,
	jetpackConnect,
	jetpackSync,
	notices,
	pageTemplates,
	plugins,
	plans,
	postFormats,
	posts,
	postTypes,
	preferences,
	preview,
	productsList,
	purchases,
	pushNotifications,
	reader,
	receipts,
	sharing,
	shortcodes,
	signup,
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

const middleware = [ thunkMiddleware, noticesMiddleware ];

if ( typeof window === 'object' ) {
	// Browser-specific middlewares
	middleware.push(
		require( './analytics/middleware.js' ).analyticsMiddleware
	);
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
