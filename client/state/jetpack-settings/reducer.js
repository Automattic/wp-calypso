/**
 * External dependencis
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import { reducer as jetpackModules } from './modules/reducer';

export default combineReducers( {
	jetpackModules
} );
