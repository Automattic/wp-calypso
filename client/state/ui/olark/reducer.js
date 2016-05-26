/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	OLARK_READY,
	OLARK_REQUEST,
	OLARK_TIMEOUT
} from 'state/action-types';
import {
	STATUS_READY,
	STATUS_TIMEOUT
} from './constants';

/**
 * Tracks olark status
 *
 * @param  {String} state  Current state
 * @param  {Object} action Action payload
 * @return {String}        Updated state
 */
export function status( state = null, action ) {
	switch ( action.type ) {
		case OLARK_READY:
			return STATUS_READY;
		case OLARK_TIMEOUT:
			if ( state !== STATUS_READY ) {
				return STATUS_TIMEOUT;
			}
			return state;
	}
	return state;
}

/**
 * Tracks olark fetching state
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Boolean}       Updated state
 */
export function requesting( state = false, action ) {
	switch ( action.type ) {
		case OLARK_READY:
		case OLARK_REQUEST:
		case OLARK_TIMEOUT:
			return action.type === OLARK_REQUEST;
	}
	return state;
}

export default combineReducers( {
	requesting,
	status
} );
