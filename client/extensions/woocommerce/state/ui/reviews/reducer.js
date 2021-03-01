/**
 * External dependencies
 */

import { combineReducers, keyedReducer } from 'calypso/state/utils';

/**
 * Internal dependencies
 */
import list from './list/reducer';

export default keyedReducer(
	'siteId',
	combineReducers( {
		list,
	} )
);
