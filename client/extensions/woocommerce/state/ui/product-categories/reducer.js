/**
 * Internal dependencies
 */

import { combineReducers, keyedReducer } from 'state/utils';
import edits from './edits-reducer';

export default keyedReducer(
	'siteId',
	combineReducers( {
		edits,
	} )
);
