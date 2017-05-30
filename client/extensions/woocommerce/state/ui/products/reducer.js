/**
 * Internal dependencies
 */
import edits from './edits-reducer';
import { combineReducers, keyedReducer } from 'state/utils';
import variations from './variations/reducer';

export default keyedReducer( 'siteId', combineReducers( {
	edits,
	variations,
} ) );
