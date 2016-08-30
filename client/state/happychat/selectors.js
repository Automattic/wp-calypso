/**
 * External dependencies
 */
import isArray from 'lodash/isArray';
import map from 'lodash/map';
import assign from 'lodash/assign';

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

// In previous implementations timeline events were stored as an array of [ 'message text', { ... properties } ]
// but are now { message: 'messaeg text', ... properties }.
// This makes sure legacy events in the reducer are the expected data types.
const fixLegacyEvent = event => {
	return isArray( event ) ? assign( {}, event[ 1 ], { message: event[ 0 ] } ) : event;
};

/**
 * Gets timeline chat events from the happychat state
 * @param {Object} state - Global redux state
 * @return [{Object}] events - an array of timeline chat events
 */
export const getHappychatTimeline = createSelector(
	state => map( state.happychat.timeline, fixLegacyEvent ),
	state => map( map( state.happychat.timeline, fixLegacyEvent ), ( { id } ) => id )
);
