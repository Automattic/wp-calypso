/**
 * Internal dependencies
 */
import feeds from './feeds/reducer';
import zones from './zones/reducer';
import { combineReducers } from 'state/utils';

export default combineReducers( {
	feeds,
	zones,
} );
