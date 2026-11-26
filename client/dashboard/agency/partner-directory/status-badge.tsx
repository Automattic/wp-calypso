import { Badge } from '@wordpress/ui';
import NotApprovedPopover from './not-approved-popover';
import type { DirectoryStatusBadge } from './lib';

interface StatusBadgeProps {
	badge: DirectoryStatusBadge;
	expertiseUrl: string;
	recordTracksEvent: ( eventName: string, properties?: Record< string, unknown > ) => void;
	shouldUseRouterLink?: boolean;
}

/**
 * A directory application status badge. When the application was rejected, it
 * carries the "not approved" popover.
 */
export default function StatusBadge( {
	badge,
	expertiseUrl,
	recordTracksEvent,
	shouldUseRouterLink,
}: StatusBadgeProps ) {
	if ( badge.key !== 'rejected' ) {
		return <Badge intent={ badge.intent }>{ badge.label }</Badge>;
	}

	return (
		<NotApprovedPopover
			expertiseUrl={ expertiseUrl }
			recordTracksEvent={ recordTracksEvent }
			shouldUseRouterLink={ shouldUseRouterLink }
		>
			<Badge intent={ badge.intent }>{ badge.label }</Badge>
		</NotApprovedPopover>
	);
}
