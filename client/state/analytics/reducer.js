/**
 * Internal dependencies
 */
import {
	ANALYTICS_TRACKING_ON,
} from 'state/action-types';

export const analyticsTracking = ( state = false, { type } ) => {
	if ( ANALYTICS_TRACKING_ON === type ) {
		return true;
	}

	if ( ANALYTICS_TRACKING_ON === type ) {
		return false;
	}

	return state;
};

export default analyticsTracking;
