/**
 * Internal dependencies
 */
import { combineReducers, withStorageKey } from 'calypso/state/utils';
import benefits from './benefits/reducer';
import { reducer as connection } from './connection/reducer';
import { reducer as credentials } from './credentials/reducer';
import { reducer as modules } from './modules/reducer';
import { settingsReducer as settings } from './settings/reducer';

const combinedReducer = combineReducers( {
	benefits,
	connection,
	credentials,
	modules,
	settings,
} );

const jetpackReducer = withStorageKey( 'jetpack', combinedReducer );
export default jetpackReducer;
