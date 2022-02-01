import getHappychatTimeline from './get-happychat-timeline';
import getLostFocusTimestamp from './get-lostfocus-timestamp';

import 'calypso/state/happychat/init';

export default function hasUnreadMessages( state ) {
	const timeline = getHappychatTimeline( state );
	if ( timeline.length === 0 ) {
		return false;
	}

	const lastMessageTimestamp = timeline[ timeline.length - 1 ].timestamp;
	const lostFocusAt = getLostFocusTimestamp( state );

	return (
		typeof lastMessageTimestamp === 'number' &&
		typeof lostFocusAt === 'number' &&
		lastMessageTimestamp >= lostFocusAt
	);
}
