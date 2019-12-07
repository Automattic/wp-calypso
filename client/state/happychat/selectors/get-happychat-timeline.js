/** @format */

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
 * @param {Object} state - Global redux state
 * @return [{Object}] events - an array of timeline chat events
 */
export default createSelector(
	state => state.happychat.chat.timeline,
	state => map( state.happychat.chat.timeline, 'id' )
);
