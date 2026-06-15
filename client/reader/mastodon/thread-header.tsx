import page from '@automattic/calypso-router';
import BackButton from 'calypso/components/back-button';
import { getTimelineUrl } from './route';
import type { MastodonConnection } from '@automattic/api-core';

interface ThreadHeaderProps {
	connection: MastodonConnection;
	onBackToTimeline?: () => void;
}

// Prefer window.history.back() so a user who navigated here via an in-app
// click returns to the previous view. Fall back to the connection timeline
// when history.length is 1 (a freshly-loaded tab opened directly on the
// thread URL) so deep-linked users still land somewhere.
export function ThreadHeader( { connection, onBackToTimeline }: ThreadHeaderProps ) {
	const timelineUrl = getTimelineUrl( connection.id );
	return (
		<BackButton
			onClick={ () => {
				onBackToTimeline?.();
				if ( window.history.length > 1 ) {
					window.history.back();
					return;
				}
				page( timelineUrl );
			} }
		/>
	);
}
