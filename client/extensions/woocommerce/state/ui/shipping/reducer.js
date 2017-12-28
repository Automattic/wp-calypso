/** @format */

/**
 * External dependencies
 */

import { combineReducers, keyedReducer } from 'client/state/utils';

/**
 * Internal dependencies
 */
import zones from './zones/reducer';

export default keyedReducer(
	'siteId',
	combineReducers( {
		zones,
	} )
);
