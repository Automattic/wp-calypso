/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import counts from './counts/reducer';
import currencies from './currencies/reducer';
import locations from './locations/reducer';

export default combineReducers( {
	counts,
	currencies,
	locations,
} );
