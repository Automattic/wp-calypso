/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	ANALYTICS_CONTINOUS_MONITOR_ON,
	ANALYTICS_CONTINOUS_MONITOR_OFF
} from 'state/action-types';
import { createReducer } from 'state/utils';

export const continuousTracking = createReducer( 'CHECKING', {
	[ ANALYTICS_CONTINOUS_MONITOR_ON ]: () => 'TRACKING',
	[ ANALYTICS_CONTINOUS_MONITOR_OFF ]: () => 'NOT_TRACKING'
} );

export default combineReducers( {
	continuousTracking
} );
