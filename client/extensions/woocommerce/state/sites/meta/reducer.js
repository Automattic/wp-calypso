/**
 * Internal dependencies
 */
import taxrates from './taxrates/reducer';
import { combineReducers } from 'state/utils';

export default combineReducers( {
	taxrates,
} );
