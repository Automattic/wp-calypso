/** @format */
/**
 * Internal dependencies
 */
import { combineReducers, createReducer } from 'state/utils';
import uploadsReducer from 'state/imports/uploads/reducer';
import { IMPORTS_FETCH_COMPLETED } from 'state/action-types';

const isHydrated = createReducer( false, {
	[ IMPORTS_FETCH_COMPLETED ]: () => true,
} );

export default combineReducers( {
	isHydrated,
	uploads: uploadsReducer,
} );
