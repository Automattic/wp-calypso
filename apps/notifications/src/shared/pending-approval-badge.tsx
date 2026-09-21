import { ExternalLink } from '@wordpress/components';
import { Icon, pending } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { type JSX } from 'react';
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
			<span className="wpnc-pending-approval-badge__text">{ translate( 'Pending approval' ) }</span>
			{ commentsUrl && (
				<ExternalLink className="wpnc-pending-approval-badge__link" href={ commentsUrl }>
					{ translate( 'Manage comments' ) }
				</ExternalLink>
			) }
		</div>
	);
};

export default PendingApprovalBadge;
