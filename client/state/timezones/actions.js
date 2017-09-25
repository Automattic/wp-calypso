/**
 * Internal dependencies
 */
import { TIMEZONES_RECEIVE, TIMEZONES_REQUEST } from 'state/action-types';

export const requestTimezones = () => ( {
	type: TIMEZONES_REQUEST
} );

export const timezonesReceive = data => ( {
	type: TIMEZONES_RECEIVE,
	...data
} );
