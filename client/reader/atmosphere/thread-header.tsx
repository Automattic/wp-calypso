import page from '@automattic/calypso-router';
import BackButton from 'calypso/components/back-button';
import { getTimelineUrl } from './route';
import type { AtmosphereConnection } from '@automattic/api-core';

interface ThreadHeaderProps {
	connection: AtmosphereConnection;
	onBackToTimeline?: () => void;
}

// Renders Calypso's shared <BackButton> in the page's top-left corner
// (position: fixed via the component's own styles). Matches Reader's
// full-post pattern. Click always returns to the connection's timeline —
// not page.back() — so deep-linked users have a guaranteed destination.
export function ThreadHeader( { connection, onBackToTimeline }: ThreadHeaderProps ) {
	const timelineUrl = getTimelineUrl( connection.id );
	return (
		<BackButton
			onClick={ () => {
				onBackToTimeline?.();
				page( timelineUrl );
			} }
		/>
	);
}
