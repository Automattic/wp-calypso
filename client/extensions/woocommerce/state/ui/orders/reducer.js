/**
 * Internal dependencies
 */
import edits from './edits/reducer';
import list from './list/reducer';
import { combineReducers, keyedReducer } from 'state/utils';

export default keyedReducer( 'siteId', combineReducers( {
	edits,
	list,
} ) );
