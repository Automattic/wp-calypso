/** @format */
/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import uploadsReducer from 'state/imports/uploads/reducer';

export default combineReducers( {
	uploads: uploadsReducer,
} );
