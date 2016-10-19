/**
 * External dependencies
 */
import map from 'lodash/map';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';

/**
 * Gets the current happychat connection status
 * @param {Object} state - global redux state
 * @return {String} current state value
 */
export const getHappychatConnectionStatus = createSelector(
	state => state.happychat.status,
	state => state.happychat.status
);

export const isHappychatAvailable = createSelector(
	state => state.happychat.isAvailable
);

/**
 * Gets timeline chat events from the happychat state
 * @param {Object} state - Global redux state
 * @return [{Object}] events - an array of timeline chat events
 */
export const getHappychatTimeline = createSelector(
	state => state.happychat.timeline,
	state => map( state.happychat.timeline, 'id' )
);
