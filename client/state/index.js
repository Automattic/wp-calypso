/**
 * External dependencies
 */
import thunkMiddleware from 'redux-thunk';
import { createStore, applyMiddleware, combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import sharing from './sharing/reducers';
import sites from './sites/reducers';

/**
 * Module variables
 */
const reducer = combineReducers( {
	sharing,
	sites
} );

export function createReduxStore() {
	return applyMiddleware(
		thunkMiddleware
	)( createStore )( reducer );
};
