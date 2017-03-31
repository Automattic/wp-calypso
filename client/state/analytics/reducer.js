/**
 * Internal dependencies
 */
import {
	ANALYTICS_CONTINOUS_MONITOR_ON,
	ANALYTICS_CONTINOUS_MONITOR_OFF
} from 'state/action-types';

export const isTracking = ( state = false, { type } ) => {
	if ( ANALYTICS_CONTINOUS_MONITOR_ON === type ) {
		return true;
	}

	if ( ANALYTICS_CONTINOUS_MONITOR_OFF === type ) {
		return false;
	}

	return state;
};

export default isTracking;
