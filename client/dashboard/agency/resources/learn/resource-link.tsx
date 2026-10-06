import { VisuallyHidden } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import type { ResourceItem, RecordTracksEvent } from './types';
import type { MouseEvent } from 'react';

export interface ResourceLinkProps {
	resource: ResourceItem;
	className: string;
	onOpenVideoModal: ( resource: ResourceItem ) => void;
	recordTracksEvent: RecordTracksEvent;
	onResourceClick?: ( resource: ResourceItem ) => void;
	tracksEventName: string;
}

/**
 * Opens a resource: videos in the in-portal modal, everything else in a new tab.
 * Styled with a stretched ::after, so its card or row is clickable as a whole.
 */
export default function ResourceLink( {
	resource,
	className,
	onOpenVideoModal,
	recordTracksEvent,
	onResourceClick,
	tracksEventName,
}: ResourceLinkProps ) {
	const isVideo = resource.format === 'video';

	const handleClick = ( event: MouseEvent ) => {
		if ( isVideo ) {
			event.preventDefault();
			onOpenVideoModal( resource );
		}

		recordTracksEvent( tracksEventName, {
			resource_id: resource.id,
			resource_name: resource.name,
		} );

		// Host-specific side effect (a8c records the event server-side).
		onResourceClick?.( resource );
	};

	return (
		<a
			className={ className }
			href={ resource.externalUrl }
			target="_blank"
			rel="noopener noreferrer"
			onClick={ handleClick }
		>
			{ resource.name }
			{ ! isVideo && (
				<VisuallyHidden as="span">
					{
						/* translators: accessibility text */
						__( '(opens in a new tab)' )
					}
				</VisuallyHidden>
			) }
		</a>
	);
}
