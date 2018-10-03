/** @format */

/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import lists from './lists/reducer';

export default combineReducers( {
	lists,
} );
