/** @format */

/**
 * Internal dependencies
 */

import { TIMEZONES_RECEIVE, TIMEZONES_REQUEST } from 'state/action-types';
import { addCoreHandlers } from 'state/data-layer/middleware';
import timezones from 'state/data-layer/wpcom/timezones';

addCoreHandlers( timezones );

export const requestTimezones = () => ( {
	type: TIMEZONES_REQUEST,
} );

export const timezonesReceive = data => ( {
	type: TIMEZONES_RECEIVE,
	...data,
} );
