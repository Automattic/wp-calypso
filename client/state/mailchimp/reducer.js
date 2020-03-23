/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import lists from './lists/reducer';
import settings from './settings/reducer';

export default combineReducers( {
	lists,
	settings,
} );
