/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import list from './list-reducer';

export default combineReducers( {
	list,
} );

