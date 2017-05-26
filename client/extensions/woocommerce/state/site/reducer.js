/**
 * External dependencies
 */
import { combineReducers } from 'state/utils';

/**
 * Internal dependencies
 */
import { keyedReducer } from 'state/utils';
import status from './status/reducer';

const siteReducer = combineReducers( {
	status,
} );

export default keyedReducer( 'siteId', siteReducer );

