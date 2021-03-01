/**
 * Internal dependencies
 */
import { ANALYTICS_TRACKING_ON } from 'calypso/state/action-types';

export function loadTrackingTool( trackingTool ) {
	return {
		type: ANALYTICS_TRACKING_ON,
		trackingTool,
	};
}
