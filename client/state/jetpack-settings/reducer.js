/**
 * External dependencis
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import { reducer as jetpackModules } from './modules/reducer';
import { reducer as jetpackModuleSettings } from './module-settings/reducer';

export default combineReducers( {
	jetpackModules,
	jetpackModuleSettings
} );
