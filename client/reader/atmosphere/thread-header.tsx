import { Icon, chevronLeft } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { getTimelineUrl } from './route';
import type { AtmosphereConnection } from '@automattic/api-core';

interface ThreadHeaderProps {
	connection: AtmosphereConnection;
	onBackToTimeline?: () => void;
}

// The author + handle of the target post is already shown inside the
// highlighted post card below this header (matches bsky.app's layout).
// Keep this header lean: just back navigation + a generic "Post" label
// for orientation.
export function ThreadHeader( { connection, onBackToTimeline }: ThreadHeaderProps ) {
	const translate = useTranslate();
	const timelineUrl = getTimelineUrl( connection.id );

	return (
		<div className="thread-header">
			<a
				className="thread-header__back-link"
				href={ timelineUrl }
				onClick={ onBackToTimeline }
				aria-label={ translate( 'Back to timeline' ) }
			>
				<Icon icon={ chevronLeft } size={ 20 } />
			</a>
			<h1 className="thread-header__title">{ translate( 'Post' ) }</h1>
		</div>
	);
}
