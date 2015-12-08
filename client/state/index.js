/**
 * External dependencies
 */
import thunkMiddleware from 'redux-thunk';
import { createStore, applyMiddleware, combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import sharing from './sharing/reducer';
import sites from './sites/reducer';
import ui from './ui/reducer';

/**
 * Module variables
 */
const reducer = combineReducers( {
	sharing,
	sites,
	ui
} );

export function createReduxStore() {
	return applyMiddleware(
		thunkMiddleware
	)( createStore )( reducer );
};
