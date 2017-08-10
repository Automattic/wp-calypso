/** @format */
/**
 * Internal dependencies
 */
import approve from './approve/reducer';
import { combineReducers } from 'state/utils';
import status from './status/reducer';

export default combineReducers( {
	approve,
	status,
} );
