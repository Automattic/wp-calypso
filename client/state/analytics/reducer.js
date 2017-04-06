/**
 * Internal dependencies
 */
import {
	ANALYTICS_TRACKING_ON,
	DESERIALIZE,
	SERIALIZE,
} from 'state/action-types';

export const analyticsTracking = ( state = false, { type } ) => {
	switch ( type ) {
		case ANALYTICS_TRACKING_ON:
			return true;

		// We don't want to persist across reloads
		case SERIALIZE:
		case DESERIALIZE:
			return false;
	}

	return state;
};

export default analyticsTracking;
