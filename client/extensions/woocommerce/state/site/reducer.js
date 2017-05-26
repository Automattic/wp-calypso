/**
 * Internal dependencies
 */
import { combineReducers, keyedReducer } from 'state/utils';
import status from './status/reducer';

const siteReducer = combineReducers( {
	status,
} );

export default keyedReducer( 'siteId', siteReducer );

