import { Icon, pending } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { getCommentsUrl, getReferenceId } from '../panel/helpers/notes';
import type { Note } from '../app/types';

import './pending-approval-badge.scss';

interface PendingApprovalBadgeProps {
	note: Note;
}

const PendingApprovalBadge = ( { note }: PendingApprovalBadgeProps ): JSX.Element => {
	const translate = useTranslate();
	const commentsUrl = getCommentsUrl( getReferenceId( note, 'site' ) );

	return (
		<div className="wpnc-pending-approval-badge">
			<Icon icon={ pending } size={ 20 } />
			<span className="wpnc-pending-approval-badge__text">{ translate( 'Pending Approval' ) }</span>
			{ commentsUrl && (
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
