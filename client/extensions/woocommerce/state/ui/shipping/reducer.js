/**
 * Internal dependencies
 */
import zones from './zones/reducer';
import { combineReducers, keyedReducer } from 'state/utils';

export default keyedReducer( 'siteId', combineReducers( {
	zones,
} ) );
