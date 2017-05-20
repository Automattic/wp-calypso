/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import { keyBy } from 'lodash';

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import {
	USER_DEVICES_REQUEST,
	USER_DEVICES_REQUEST_SUCCESS,
} from 'state/action-types';

export const items = createReducer( {}, {
	[ USER_DEVICES_REQUEST_SUCCESS ]: ( state, { devices } ) => ( { ...keyBy( devices, 'device_id' ) } )
} );

export const isRequesting = ( state = false, { type } ) => ( type === USER_DEVICES_REQUEST );

export default combineReducers( { items, isRequesting } );
