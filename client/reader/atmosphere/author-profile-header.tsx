import page from '@automattic/calypso-router';
import BackButton from 'calypso/components/back-button';
import { getTimelineUrl } from './route';
import type { AtmosphereConnection } from '@automattic/api-core';

interface AuthorProfileHeaderProps {
	connection: AtmosphereConnection;
	onBackToTimeline?: () => void;
}

// Mirrors slice-5's ThreadHeader: just a BackButton that always navigates to
// the timeline (not page.back()) so deep-linked users land somewhere. The
// panel owns the Tracks dispatch via the optional onBackToTimeline callback.
// SocialProfileCard renders the display-name heading inside the panel body —
// no heading lives here.
export function AuthorProfileHeader( { connection, onBackToTimeline }: AuthorProfileHeaderProps ) {
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
