/**
 * Internal dependencies
 */
import { combineReducers, keyedReducer } from 'state/utils';
import edits from './edits-reducer';
import list from './list-reducer';

export default combineReducers( {
	edits: keyedReducer( 'siteId', edits ),
	list,
} );
