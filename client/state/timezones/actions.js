/**
 * Internal dependencies
 */
import { TIMEZONES_RECEIVE, TIMEZONES_REQUEST } from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/timezones';
import 'calypso/state/timezones/init';

export const requestTimezones = () => ( {
	type: TIMEZONES_REQUEST,
} );

export const timezonesReceive = ( data ) => ( {
	type: TIMEZONES_RECEIVE,
	...data,
} );
