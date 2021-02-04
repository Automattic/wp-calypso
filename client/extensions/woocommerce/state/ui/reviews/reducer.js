/**
 * External dependencies
 */
import { keyedReducer } from '@automattic/state-utils';

/**
 * Internal dependencies
 */
import { combineReducers } from 'calypso/state/utils';
import list from './list/reducer';

export default keyedReducer(
	'siteId',
	combineReducers( {
		list,
	} )
);
