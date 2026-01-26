/* eslint-disable wpcalypso/jsx-classname-namespace */

import { ReactElement } from 'react';
import type { Note } from '../app/types';
import { getCommentsUrl, getReferenceId } from '../panel/helpers/notes';

import './pending-approval-badge.scss';

interface PendingApprovalBadgeProps {
	note: Note;
	translate: ( text: string ) => string;
	icon: ReactElement;
}

/**
 * PendingApprovalBadge component that works with both modern and legacy systems
 */
const PendingApprovalBadge = ( { note, translate, icon }: PendingApprovalBadgeProps ) => {
	const commentsUrl = getCommentsUrl( getReferenceId( note, 'site' ) );
	const pendingText = translate( 'Pending Approval' );
	const manageText = translate( 'Manage Comments' );

	return (
		<div className="wpnc__pending-approval-badge">
			{ icon }
			<span className="wpnc__pending-approval-badge__text">{ pendingText }</span>
			{ commentsUrl && (
				<a
					className="wpnc__pending-approval-badge__link"
					href={ commentsUrl }
					target="_blank"
					rel="noopener noreferrer"
				>
					{ manageText }
				</a>
			) }
		</div>
	);
};

export default PendingApprovalBadge;