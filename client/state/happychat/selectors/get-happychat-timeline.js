/**
 * External dependencies
 */
import { map } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';

/**
 * Gets timeline chat events from the happychat state
 *
 * @param {object} state - Global redux state
 * @returns [{object}] events - an array of timeline chat events
 */
export default createSelector(
	( state ) => state.happychat.chat.timeline,
	( state ) => map( state.happychat.chat.timeline, 'id' )
);
