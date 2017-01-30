/**
 * External dependencis
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import { reducer as connection } from './connection/reducer';
import { reducer as jetpackJumpstart } from './jumpstart/reducer';
import { reducer as jetpackModules } from './modules/reducer';
import { reducer as settings } from './settings/reducer';

export default combineReducers( {
	connection,
	jetpackJumpstart,
	jetpackModules,
	settings
} );
