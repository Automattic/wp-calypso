/**
 * Internal dependencies
 */
import list from './list/reducer';
import { combineReducers, keyedReducer } from 'state/utils';

export default keyedReducer( 'siteId', combineReducers( {
	list,
} ) );
