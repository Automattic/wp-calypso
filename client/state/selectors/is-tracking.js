/**
 * Returns true if tracking is enabled for a given tracking tool
 * 
 *
 * @format
 * @param {String}  trackingTool The name of the tracking tool
 * @return {Boolean}              Whether tracking is enabled
 */

export default function isTracking( state, trackingTool ) {
	return !! state.analyticsTracking[ trackingTool ];
}
