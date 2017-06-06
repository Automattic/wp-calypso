/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import general from './general/reducer';

export default combineReducers( {
	general,
} );
