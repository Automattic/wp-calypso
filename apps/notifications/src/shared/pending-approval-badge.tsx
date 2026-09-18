import { Icon, pending } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { type JSX } from 'react';
import { getCommentsUrl, getReferenceId } from '../panel/helpers/notes';
import type { Note } from '../app/types';

import './pending-approval-badge.scss';

interface PendingApprovalBadgeProps {
	note: Note;
	// Off in the note list, where the whole row is one button and a nested link
	// would be unreachable.
	showManageLink?: boolean;
}

const PendingApprovalBadge = ( {
	note,
	showManageLink = true,
}: PendingApprovalBadgeProps ): JSX.Element => {
	const translate = useTranslate();
	const commentsUrl = getCommentsUrl( getReferenceId( note, 'site' ) );

	return (
		<div className="wpnc-pending-approval-badge">
			<Icon icon={ pending } size={ 20 } />
			<span className="wpnc-pending-approval-badge__text">{ translate( 'Pending Approval' ) }</span>
			{ showManageLink && commentsUrl && (
				<a
					className="wpnc-pending-approval-badge__link"
					href={ commentsUrl }
					target="_blank"
					rel="noopener noreferrer"
				>
					{ translate( 'Manage Comments' ) }
				</a>
			) }
		</div>
	);
};

export default PendingApprovalBadge;
