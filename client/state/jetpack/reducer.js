/**
 * Internal dependencies
 *
 * @format
 */

import { reducer as connection } from './connection/reducer';
import { combineReducers } from 'state/utils';
import { reducer as jumpstart } from './jumpstart/reducer';
import { reducer as modules } from './modules/reducer';
import { reducer as settings } from './settings/reducer';
import { reducer as credentials } from './credentials/reducer';

export default combineReducers( {
	connection,
	credentials,
	jumpstart,
	modules,
	settings,
} );
