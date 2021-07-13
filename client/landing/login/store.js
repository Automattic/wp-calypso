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
import currentUser from 'calypso/state/current-user/reducer';

// Legacy reducers
// The reducers in this list are not modularized, and are always loaded on boot.
const rootReducer = combineReducers( {
	httpData,
	currentUser,
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
