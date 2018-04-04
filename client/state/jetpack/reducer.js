/** @format */

/**
 * Internal dependencies
 */

import { reducer as connection } from './connection/reducer';
import { combineReducers } from 'state/utils';
import { reducer as credentials } from './credentials/reducer';
import { reducer as jumpstart } from './jumpstart/reducer';
import { reducer as modules } from './modules/reducer';
import { reducer as onboarding } from './onboarding/reducer';
import { settingsReducer as settings } from '../jetpack-onboarding/reducer'; // Only temporary! @ockham

export default combineReducers( {
	connection,
	credentials,
	jumpstart,
	modules,
	onboarding,
	settings,
} );
