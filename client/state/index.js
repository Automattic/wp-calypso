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
import notices from './notices/reducers';

/**
 * Module variables
 */
const reducer = combineReducers( {
	sharing,
	sites,
	ui,
    notices
} );

export function createReduxStore() {
	return applyMiddleware(
		thunkMiddleware
	)( createStore )( reducer );
};
