/**
 * Internal dependencies
 */
import {
	TIMEZONES_RECEIVE,
	TIMEZONES_REQUEST,
	TIMEZONES_REQUEST_FAILURE,
	TIMEZONES_REQUEST_SUCCESS
} from 'state/action-types';

export const requestTimezones = () => ( {
	type: TIMEZONES_REQUEST
} );

export const timezonesRequestSuccess = () => ( {
	type: TIMEZONES_REQUEST_SUCCESS
} );

export const timezonesRequestFailure = error => ( {
	type: TIMEZONES_REQUEST_FAILURE,
	error
} );

export const timezonesReceive = data => ( {
	type: TIMEZONES_RECEIVE,
	...data
} );
