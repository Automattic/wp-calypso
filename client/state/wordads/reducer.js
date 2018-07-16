/** @format */

/**
 * Internal dependencies
 */

import { combineReducers } from 'state/utils';
import approve from './approve/reducer';
import earnings from './earnings/reducer';
import stats from './stats/reducer';
import status from './status/reducer';

export default combineReducers( {
	approve,
	earnings,
	stats,
	status,
} );
