/**
 * External dependencies
 */
import thunkMiddleware from 'redux-thunk';
import { createStore, applyMiddleware, combineReducers, compose } from 'redux';

/**
 * Internal dependencies
 */
import { analyticsMiddleware } from 'lib/themes/middlewares.js';
import notices from './notices/reducer';
import posts from './posts/reducer';
import sharing from './sharing/reducer';
import sites from './sites/reducer';
import siteSettings from './site-settings/reducer'
import themes from 'lib/themes/reducers';
import users from './users/reducer';
import ui from './ui/reducer';

/**
 * Module variables
 */
const reducer = combineReducers( {
	notices,
	posts,
	sharing,
	sites,
	siteSettings,
	themes,
	users,
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
