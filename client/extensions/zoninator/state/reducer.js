/**
 * Internal dependencies
 */
import { withStorageKey } from '@automattic/state-utils';
import { combineReducers } from 'calypso/state/utils';
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
