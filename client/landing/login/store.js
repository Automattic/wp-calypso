/**
 * External dependencies
 */
import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';

/**
 * Internal dependencies
 */
import wpcomApiMiddleware from 'state/data-layer/wpcom-api-middleware';
import { reducer as httpData, enhancer as httpDataEnhancer } from 'state/data-layer/http-data';
import { combineReducers } from 'state/utils';
import application from 'state/application/reducer';
import documentHead from 'state/document-head/reducer';
import login from 'state/login/reducer';
import language from 'state/ui/language/reducer';
import route from 'state/ui/route/reducer';
import masterbarVisibility from 'state/ui/masterbar-visibility/reducer';
import section from 'state/ui/section/reducer';
import notices from 'state/notices/reducer';
import i18n from 'state/i18n/reducer';
import users from 'state/users/reducer';
import currentUser from 'state/current-user/reducer';
import preferences from 'state/preferences/reducer';

// Create Redux store
const reducer = combineReducers( {
	application,
	documentHead,
	httpData,
	login,
	notices,
	i18n,
	users,
	currentUser,
	preferences,
	ui: combineReducers( {
		language,
		route,
		masterbarVisibility,
		section,
	} ),
} );

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default () =>
	createStore(
		reducer,
		composeEnhancers( httpDataEnhancer, applyMiddleware( thunkMiddleware, wpcomApiMiddleware ) )
	);
