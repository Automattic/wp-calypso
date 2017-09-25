/**
 * Internal dependencies
 */
import edits from './edits-reducer';
import list from './list-reducer';
import search from './search-reducer';
import variations from './variations/reducer';
import { combineReducers, keyedReducer } from 'state/utils';

export default keyedReducer( 'siteId', combineReducers( {
	list,
	edits,
	search,
	variations,
} ) );
