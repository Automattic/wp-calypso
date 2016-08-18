/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import approve from './approve/reducer';
import status from './status/reducer';

export default combineReducers( {
	approve,
	status
} );
