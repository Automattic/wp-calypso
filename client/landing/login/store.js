/**
 * External dependencies
 */
import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';

/**
 * Internal dependencies
 */
import wpcomApiMiddleware from 'calypso/state/data-layer/wpcom-api-middleware';
import analyticsMiddleware from 'calypso/state/analytics/middleware';
import {
	reducer as httpData,
	enhancer as httpDataEnhancer,
} from 'calypso/state/data-layer/http-data';
import { combineReducers, addReducerEnhancer } from 'calypso/state/utils';
import documentHead from 'calypso/state/document-head/reducer';
import language from 'calypso/state/ui/language/reducer';
import masterbarVisibility from 'calypso/state/ui/masterbar-visibility/reducer';
import section from 'calypso/state/ui/section/reducer';
import notices from 'calypso/state/notices/reducer';
import i18n from 'calypso/state/i18n/reducer';
import users from 'calypso/state/users/reducer';
import currentUser from 'calypso/state/current-user/reducer';

// Legacy reducers
// The reducers in this list are not modularized, and are always loaded on boot.
const rootReducer = combineReducers( {
	documentHead,
	httpData,
	notices,
	i18n,
	users,
	currentUser,
	ui: combineReducers( {
		language,
		masterbarVisibility,
		section,
	} ),
} );

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default () =>
	createStore(
		rootReducer,
		composeEnhancers(
			addReducerEnhancer,
			httpDataEnhancer,
			applyMiddleware( thunkMiddleware, wpcomApiMiddleware, analyticsMiddleware )
		)
	);
