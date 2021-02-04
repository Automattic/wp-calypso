/**
 * External dependencies
 */
import { keyedReducer } from '@automattic/state-utils';

/**
 * Internal dependencies
 */
import { combineReducers } from 'calypso/state/utils';
import zones from './zones/reducer';

export default keyedReducer(
	'siteId',
	combineReducers( {
		zones,
	} )
);
