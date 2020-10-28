/**
 * Internal dependencies
 */

import { combineReducers, keyedReducer } from 'calypso/state/utils';
import edits from './edits-reducer';

export default keyedReducer(
	'siteId',
	combineReducers( {
		edits,
	} )
);
