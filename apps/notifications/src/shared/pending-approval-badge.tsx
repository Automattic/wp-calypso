import { ExternalLink } from '@wordpress/components';
import { Icon, pending } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { type JSX } from 'react';

import './pending-approval-badge.scss';

interface PendingApprovalBadgeProps {
	commentsUrl?: string | null;
	// Off in the note list, where the whole row is one button and a nested link
	// would be unreachable.
	showManageLink?: boolean;
}

const PendingApprovalBadge = ( {
	commentsUrl,
	showManageLink = true,
}: PendingApprovalBadgeProps ): JSX.Element => {
	const translate = useTranslate();

	return (
		<div className="wpnc-pending-approval-badge">
			<Icon icon={ pending } size={ 20 } />
			<span className="wpnc-pending-approval-badge__text">{ translate( 'Pending approval' ) }</span>
			{ showManageLink && commentsUrl && (
				<ExternalLink className="wpnc-pending-approval-badge__link" href={ commentsUrl }>
					{ translate( 'Manage comments' ) }
				</ExternalLink>
			) }
		</div>
	);
};

export default PendingApprovalBadge;
