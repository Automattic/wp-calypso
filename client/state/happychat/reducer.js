/** @format */

/**
 * Internal dependencies
 */
import {
	SERIALIZE,
	DESERIALIZE,
	HAPPYCHAT_SET_AVAILABLE,
	HAPPYCHAT_BLUR,
	HAPPYCHAT_CONNECTING,
	HAPPYCHAT_CONNECTED,
	HAPPYCHAT_DISCONNECTED,
	HAPPYCHAT_FOCUS,
	HAPPYCHAT_RECONNECTING,
} from 'state/action-types';
import { combineReducers, createReducer, isValidStateWithSchema } from 'state/utils';
import { geoLocationSchema } from './schema';
import chat from './chat/reducer';

/**
 * Tracks the current user geo location.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const geoLocation = createReducer(
	null,
	{
		[ HAPPYCHAT_CONNECTED ]: ( state, action ) => {
			const { user: { geo_location } } = action;
			if ( geo_location && geo_location.country_long && geo_location.city ) {
				return geo_location;
			}
			return state;
		},
	},
	geoLocationSchema
);

/**
 * Tracks the state of the happychat client connection
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 *
 */
const connectionStatus = ( state = 'uninitialized', action ) => {
	switch ( action.type ) {
		case HAPPYCHAT_CONNECTING:
			return 'connecting';
		case HAPPYCHAT_CONNECTED:
			return 'connected';
		case HAPPYCHAT_DISCONNECTED:
			return 'disconnected';
		case HAPPYCHAT_RECONNECTING:
			return 'reconnecting';
	}
	return state;
};

const connectionError = ( state = null, action ) => {
	switch ( action.type ) {
		case HAPPYCHAT_CONNECTED:
			return null;
		case HAPPYCHAT_DISCONNECTED:
			return action.errorStatus;
	}
	return state;
};

/**
 * Tracks whether happychat.io is accepting new chats.
 *
 * @param  {Boolean} state  Current happychat status
 * @param  {Object}  action Action playload
 * @return {Boolean}        Updated happychat status
 */
const isAvailable = ( state = false, action ) => {
	switch ( action.type ) {
		case HAPPYCHAT_SET_AVAILABLE:
			return action.isAvailable;
	}
	return state;
};

/**
 * Tracks the last time Happychat had focus. This lets us determine things like
 * whether the user has unread messages. A numerical value is the timestamp where focus
 * was lost, and `null` means HC currently has focus.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const lostFocusAt = ( state = null, action ) => {
	switch ( action.type ) {
		case SERIALIZE:
			// If there's already a timestamp set, use that. Otherwise treat a SERIALIZE as a
			// "loss of focus" since it represents the state when the browser (and HC) closed.
			if ( state === null ) {
				return Date.now();
			}
			return state;
		case DESERIALIZE:
			if ( isValidStateWithSchema( state, { type: 'number' } ) ) {
				return state;
			}
			return null;
		case HAPPYCHAT_BLUR:
			return Date.now();
		case HAPPYCHAT_FOCUS:
			return null;
	}
	return state;
};
lostFocusAt.hasCustomPersistence = true;

export default combineReducers( {
	connectionError,
	connectionStatus,
	isAvailable,
	lostFocusAt,
	geoLocation,
	chat,
} );
