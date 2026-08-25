import { Badge } from '@automattic/ui';
import NotApprovedPopover from './not-approved-popover';
import type { DirectoryStatusBadge } from './lib';

interface Props {
	badge: DirectoryStatusBadge;
	showPopoverOnLoad: boolean;
	expertiseUrl: string;
	recordTracksEvent: ( eventName: string, properties?: Record< string, unknown > ) => void;
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
}: Props ) {
	if ( badge.key !== 'rejected' ) {
		return <Badge intent={ badge.intent }>{ badge.label }</Badge>;
	}

	return (
		<NotApprovedPopover
			showOnLoad={ showPopoverOnLoad }
			expertiseUrl={ expertiseUrl }
			recordTracksEvent={ recordTracksEvent }
		>
			<Badge intent={ badge.intent }>{ badge.label }</Badge>
		</NotApprovedPopover>
	);
}
