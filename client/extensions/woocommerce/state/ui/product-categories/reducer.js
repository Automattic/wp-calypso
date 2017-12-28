/** @format */

/**
 * Internal dependencies
 */

import { combineReducers, keyedReducer } from 'client/state/utils';
import edits from './edits-reducer';

export default keyedReducer(
	'siteId',
	combineReducers( {
		edits,
	} )
);
