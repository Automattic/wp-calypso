/**
 * Internal dependencies
 */
import { TIMEZONES_RECEIVE, TIMEZONES_REQUEST } from 'state/action-types';

import 'state/data-layer/wpcom/timezones';
import 'state/timezones/init';

export const requestTimezones = () => ( {
	type: TIMEZONES_REQUEST,
} );

export const timezonesReceive = ( data ) => ( {
	type: TIMEZONES_RECEIVE,
	...data,
} );
