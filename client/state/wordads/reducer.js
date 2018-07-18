/** @format */

/**
 * Internal dependencies
 */

import { combineReducers } from 'state/utils';
import approve from './approve/reducer';
import status from './status/reducer';
import earnings from './earnings/reducer';

export default combineReducers( {
	approve,
	status,
	earnings,
} );
