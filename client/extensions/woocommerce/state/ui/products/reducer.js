/**
 * External dependencies
 */
import { keyedReducer } from '@automattic/state-utils';

/**
 * Internal dependencies
 */
import { combineReducers } from 'calypso/state/utils';
import edits from './edits-reducer';
import list from './list-reducer';
import variations from './variations/reducer';

export default keyedReducer(
	'siteId',
	combineReducers( {
		list,
		edits,
		variations,
	} )
);
