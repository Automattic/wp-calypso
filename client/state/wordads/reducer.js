/**
 * Internal dependencies
 */

import { combineReducers } from 'state/utils';
import approve from './approve/reducer';
import earnings from './earnings/reducer';
import status from './status/reducer';

export default combineReducers( {
	approve,
	earnings,
	status,
} );
