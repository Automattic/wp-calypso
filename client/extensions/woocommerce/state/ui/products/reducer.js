/**
 * Internal dependencies
 */
import { combineReducers, keyedReducer } from 'calypso/state/utils';
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
