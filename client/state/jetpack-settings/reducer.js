/**
 * External dependencis
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import { reducer as jetpackConnection } from './connection/reducer';
import { reducer as jetpackJumpstart } from './jumpstart/reducer';
import { reducer as jetpackModules } from './modules/reducer';
import { reducer as jetpackModuleSettings } from './module-settings/reducer';

export default combineReducers( {
	jetpackConnection,
	jetpackJumpstart,
	jetpackModules,
	jetpackModuleSettings
} );
