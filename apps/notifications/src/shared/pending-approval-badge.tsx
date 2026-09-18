import { Icon, pending } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { type JSX } from 'react';

import './pending-approval-badge.scss';

interface PendingApprovalBadgeProps {
	commentsUrl?: string | null;
}

const PendingApprovalBadge = ( { commentsUrl }: PendingApprovalBadgeProps ): JSX.Element => {
	const translate = useTranslate();

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
