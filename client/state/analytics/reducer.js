/**
 * Internal dependencies
 */
import { ANALYTICS_TRACKING_ON } from 'state/action-types';

export const analyticsTracking = ( state = {}, { type, meta } ) => {
	switch ( type ) {
		case ANALYTICS_TRACKING_ON:
			return meta.analytics.reduce( ( newState, { payload: trackingTool } ) => {
				return { ...newState, [ trackingTool ]: true };
			}, state );
	}

	return state;
};

export default analyticsTracking;
