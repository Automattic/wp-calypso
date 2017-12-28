/** @format */

/**
 * Internal dependencies
 */

import { combineReducers } from 'client/state/utils';
import feeds from './feeds/reducer';
import zones from './zones/reducer';

export default combineReducers( {
	feeds,
	zones,
} );
