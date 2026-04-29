import page from '@automattic/calypso-router';
import BackButton from 'calypso/components/back-button';
import { getTimelineUrl } from './route';
import type { AtmosphereConnection } from '@automattic/api-core';

interface ThreadHeaderProps {
	connection: AtmosphereConnection;
	onBackToTimeline?: () => void;
}

// Always navigate to the timeline — not page.back() — so deep-linked users land somewhere.
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
