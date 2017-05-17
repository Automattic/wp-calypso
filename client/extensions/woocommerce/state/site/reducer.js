/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import { keyedReducer } from 'state/utils';
import status from './status/reducer';

const siteReducer = combineReducers( {
	status,
} );

export default keyedReducer( 'siteId', siteReducer );

