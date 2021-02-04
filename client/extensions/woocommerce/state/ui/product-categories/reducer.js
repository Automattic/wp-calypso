/**
 * External dependencies
 */
import { keyedReducer } from '@automattic/state-utils';

/**
 * Internal dependencies
 */
import { combineReducers } from 'calypso/state/utils';
import edits from './edits-reducer';

export default keyedReducer(
	'siteId',
	combineReducers( {
		edits,
	} )
);
