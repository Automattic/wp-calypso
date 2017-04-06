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

	return state;
};

export default analyticsTracking;
