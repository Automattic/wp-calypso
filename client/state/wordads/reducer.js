/** @format */

/**
 * Internal dependencies
 */

import approve from './approve/reducer';
import { combineReducers } from 'client/state/utils';
import status from './status/reducer';

export default combineReducers( {
	approve,
	status,
} );
