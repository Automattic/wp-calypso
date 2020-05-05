/**
 * Internal dependencies
 */

import { combineReducers } from 'state/utils';
import approve from './approve/reducer';
import earnings from './earnings/reducer';
import settings from './settings/reducer';
import status from './status/reducer';

export default combineReducers( {
	approve,
	earnings,
	settings,
	status,
} );
