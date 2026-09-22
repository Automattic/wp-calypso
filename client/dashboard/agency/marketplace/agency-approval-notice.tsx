import { userPreferenceMutation, userPreferenceQuery } from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Notice } from '../../components/notice';
import { a4aLink } from '../../utils/link';
import type { Agency } from '@automattic/api-core';

// Shared with the classic dashboard so a dismissal carries over.
const DISMISS_PREFERENCE = 'a4a-agency-approval-notice-dismissed';

// Once approved, the welcome only shows for the agency's first week.
const APPROVED_NOTICE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Tells the agency where its application stands: pending agencies can look
 * around but not buy or refer, rejected ones are pointed to support, and newly
 * approved ones get a welcome they can dismiss.
 */
export default function AgencyApprovalNotice( { agency }: { agency: Agency | null | undefined } ) {
	const { data: isDismissed, isFetched } = useQuery( userPreferenceQuery( DISMISS_PREFERENCE ) );
	const { mutate: saveDismissed } = useMutation( userPreferenceMutation( DISMISS_PREFERENCE ) );

	const status = agency?.approval_status;
	if ( ! status || ! isFetched || isDismissed ) {
		return null;
	}

	if ( status === 'pending' ) {
		return (
			<Notice variant="warning">
				{ __(
					'Welcome to Automattic for Agencies! While we review your agency, feel free to explore. Purchases and referrals will be unlocked once you’re approved for the program. Don’t worry, we review most applications within a few hours!'
				) }
			</Notice>
		);
	}

	if ( status === 'rejected' ) {
		return (
			<Notice variant="error">
				{ createInterpolateElement(
					__(
						'We have not approved your application for the Automattic for Agencies program. Please <a>contact support</a> to discuss this further if you think this was done in error.'
					),
					// TODO: The MSD has no contact-support widget yet; this opens the
					// classic one, as the Pressable section does.
					{ a: <a href={ a4aLink( '/overview#contact-support' ) } /> }
				) }
			</Notice>
		);
	}

	const createdAt = agency?.created_at ? new Date( agency.created_at ).getTime() : 0;
	if ( createdAt < Date.now() - APPROVED_NOTICE_WINDOW_MS ) {
		return null;
	}

	return (
		<Notice variant="success" onClose={ () => saveDismissed( true ) }>
			{ __(
				'Welcome to Automattic for Agencies. Your application has been approved! You can now make purchases in the portal.'
			) }
		</Notice>
	);
}
