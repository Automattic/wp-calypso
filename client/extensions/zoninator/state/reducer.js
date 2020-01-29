/**
 * Internal dependencies
 */

import { combineReducers, withStorageKey } from 'state/utils';
import feeds from './feeds/reducer';
import locks from './locks/reducer';
import zones from './zones/reducer';

export default withStorageKey(
	'zoninator',
	combineReducers( {
		feeds,
		locks,
		zones,
	} )
);
