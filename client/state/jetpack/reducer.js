/** @format */

/**
 * Internal dependencies
 */

import { reducer as connection } from './connection/reducer';
import { combineReducers } from 'client/state/utils';
import { reducer as credentials } from './credentials/reducer';
import { reducer as jumpstart } from './jumpstart/reducer';
import { reducer as modules } from './modules/reducer';
import { reducer as settings } from './settings/reducer';

export default combineReducers( {
	connection,
	credentials,
	jumpstart,
	modules,
	settings,
} );
