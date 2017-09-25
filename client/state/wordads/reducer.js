/**
 * Internal dependencies
 */
import approve from './approve/reducer';
import status from './status/reducer';
import { combineReducers } from 'state/utils';

export default combineReducers( {
	approve,
	status
} );
