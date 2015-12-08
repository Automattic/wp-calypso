/**
 * External dependencies
 */
import thunkMiddleware from 'redux-thunk';
import { createStore, applyMiddleware, combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import { analyticsMiddleware } from 'lib/themes/middlewares.js';
import sharing from './sharing/reducer';
import sites from './sites/reducer';
import siteSettings from './site-settings/reducer'
import themes from 'lib/themes/reducers';
import ui from './ui/reducer';
import notices from './notices/reducers';

/**
 * Module variables
 */
const reducer = combineReducers( {
	notices,
	sharing,
	sites,
	siteSettings,
	themes,
	ui
} );

export function createReduxStore() {
	return applyMiddleware(
		thunkMiddleware,
		analyticsMiddleware
	)( createStore )( reducer );
};
