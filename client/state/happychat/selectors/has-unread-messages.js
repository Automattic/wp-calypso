/**
 * External dependencies
 */
import { get, last } from 'lodash';

/**
 * Internal dependencies
 */
import { createSelector } from '@automattic/state-utils';
import getHappychatTimeline from 'calypso/state/happychat/selectors/get-happychat-timeline';
import getLostFocusTimestamp from 'calypso/state/happychat/selectors/get-lostfocus-timestamp';

export default createSelector(
	( state ) => {
		const lastMessageTimestamp = get( last( getHappychatTimeline( state ) ), 'timestamp' );
		const lostFocusAt = getLostFocusTimestamp( state );

		return (
			typeof lastMessageTimestamp === 'number' &&
			typeof lostFocusAt === 'number' &&
			lastMessageTimestamp >= lostFocusAt
		);
	},
	[ getHappychatTimeline, getLostFocusTimestamp ]
);
