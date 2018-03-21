/** @format */
/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import currencies from './currencies/reducer';
import locations from './locations/reducer';

export default combineReducers( {
	currencies,
	locations,
} );
