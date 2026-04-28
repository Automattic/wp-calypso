import { useTranslate } from 'i18n-calypso';
import NavigationHeader from 'calypso/components/navigation-header';
import { getTimelineUrl } from './route';
import type { AtmosphereConnection, AtmosphereFeedItem } from '@automattic/api-core';

interface ThreadHeaderProps {
	connection: AtmosphereConnection;
	targetPost: AtmosphereFeedItem | null;
	onBackToTimeline?: () => void;
}

export function ThreadHeader( { connection, targetPost, onBackToTimeline }: ThreadHeaderProps ) {
	const translate = useTranslate();
	const timelineUrl = getTimelineUrl( connection.id );

	const title = targetPost
		? targetPost.author.display_name || targetPost.author.handle
		: translate( 'Thread' );
	const subtitle = targetPost ? `@${ targetPost.author.handle }` : undefined;

	return (
		<>
			<a href={ timelineUrl } onClick={ onBackToTimeline }>
				{ translate( 'Back to timeline' ) }
			</a>
			<NavigationHeader title={ title } subtitle={ subtitle } />
		</>
	);
}
