import { Badge } from '@wordpress/ui';
import NotApprovedPopover from './not-approved-popover';
import type { DirectoryStatusBadge } from './lib';

interface Props {
	badge: DirectoryStatusBadge;
	showPopoverOnLoad: boolean;
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
	showPopoverOnLoad,
	expertiseUrl,
	recordTracksEvent,
	shouldUseRouterLink,
}: Props ) {
	if ( badge.key !== 'rejected' ) {
		return <Badge intent={ badge.intent }>{ badge.label }</Badge>;
	}

	return (
		<NotApprovedPopover
			showOnLoad={ showPopoverOnLoad }
			expertiseUrl={ expertiseUrl }
			recordTracksEvent={ recordTracksEvent }
			shouldUseRouterLink={ shouldUseRouterLink }
		>
			<Badge intent={ badge.intent }>{ badge.label }</Badge>
		</NotApprovedPopover>
	);
}
