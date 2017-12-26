/** @format */

/**
 * Internal dependencies
 */

import { combineReducers } from 'state/utils';
import feeds from './feeds/reducer';
import locks from './feeds/reducer';
import zones from './zones/reducer';

export default combineReducers( {
	feeds,
	locks,
	zones,
} );
