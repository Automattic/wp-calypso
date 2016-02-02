/**
 * External dependencies
 */
import thunkMiddleware from 'redux-thunk';
import { createStore, applyMiddleware, combineReducers, compose } from 'redux';

/**
 * Internal dependencies
 */
import { analyticsMiddleware } from './themes/middlewares.js';
import application from './application/reducer';
import notices from './notices/reducer';
import posts from './posts/reducer';
import plugins from './plugins/reducer';
import sharing from './sharing/reducer';
import sites from './sites/reducer';
import siteSettings from './site-settings/reducer'
import support from './support/reducer'
import themes from './themes/reducer';
import users from './users/reducer';
import currentUser from './current-user/reducer';
import ui from './ui/reducer';

/**
 * Module variables
 */
const reducer = combineReducers( {
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

var createStoreWithMiddleware = applyMiddleware(
	thunkMiddleware,
	analyticsMiddleware
);

export function createReduxStore() {
	if (
		typeof window === 'object' &&
		window.app &&
		window.app.isDebug &&
		window.devToolsExtension
	) {
		createStoreWithMiddleware = compose( createStoreWithMiddleware, window.devToolsExtension() );
	}
	return createStoreWithMiddleware( createStore )( reducer );
};
