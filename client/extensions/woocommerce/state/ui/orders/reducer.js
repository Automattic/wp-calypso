/**
 * External dependencies
 */

import { combineReducers, keyedReducer } from 'calypso/state/utils';

/**
 * Internal dependencies
 */
import edits from './edits/reducer';
import list from './list/reducer';

export default keyedReducer(
	'siteId',
	combineReducers( {
		edits,
		list,
	} )
);
