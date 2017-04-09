/**
 * External dependencis
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import { reducer as connection } from './connection/reducer';
import { reducer as jumpstart } from './jumpstart/reducer';
import { reducer as modules } from './modules/reducer';
import { reducer as settings } from './settings/reducer';

export default combineReducers( {
	connection,
	jumpstart,
	modules,
	settings
} );
