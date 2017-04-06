/**
 * Internal dependencies
 */
import {
	ANALYTICS_TRACKING_ON,
	DESERIALIZE,
	SERIALIZE,
} from 'state/action-types';

export const analyticsTracking = ( state = {}, { type, meta } ) => {
	switch ( type ) {
		case ANALYTICS_TRACKING_ON:
			return meta.analytics.reduce( ( newState, { payload: trackingTool } ) => {
				return { ...newState, [ trackingTool ]: true };
			}, state );

		// This is for tracking tools that get attached to the DOM once on component mount, and
		// monitor continuously then. Since we need to re-attach them when the user reloads a page,
		// we don't want to serialize state but always start initialized as 'not tracking'.
		case SERIALIZE:
		case DESERIALIZE:
			return {};
	}

	return state;
};

export default analyticsTracking;
