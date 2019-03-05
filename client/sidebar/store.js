/**
 * External dependencies
 */
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';

/**
 * Internal dependencies
 */
import wpcomApiMiddleware from 'state/data-layer/wpcom-api-middleware';
import { combineReducers } from 'state/utils';
import currentUser from 'state/current-user/reducer';
import media from 'state/media/reducer';
import preferences from 'state/preferences/reducer';
import postTypes from 'state/post-types/reducer';
import sites from 'state/sites/reducer';
import siteSettings from 'state/site-settings/reducer';
import stats from 'state/stats/reducer';
import users from 'state/users/reducer';
import layoutFocus from 'state/ui/layout-focus/reducer';

// Create Redux store
const reducer = combineReducers( {
	currentUser,
	media,
	preferences,
	postTypes,
	sites,
	siteSettings,
	stats,
	users,
	ui: combineReducers( {
		layoutFocus,
	} ),
} );

export default () => createStore( reducer, applyMiddleware( thunkMiddleware, wpcomApiMiddleware ) );
