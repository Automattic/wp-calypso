import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { Notice } from '../../components/notice';
import { useOnboardingTour } from '../onboarding-tour';
import { useOptInPreview } from '../opt-in-preview/store';

/**
 * The first visit after the agency switches: on whichever agency page they land on first,
 * since classic links forward to the matching page.
 */
export function useWelcomeNoticeEligibility() {
	const preview = useOptInPreview();
	return !! preview && preview.agency === 'opted-in' && preview.firstVisit;
}

export default function WelcomeNotice() {
	const preview = useOptInPreview();
	const { openTour } = useOnboardingTour();
	const [ isDismissed, setIsDismissed ] = useState( false );
	if ( ! preview || isDismissed ) {
		return null;
	}
	const isOwner = preview.role === 'owner';
	return (
		<div className="a4a-dashboard-welcome-notice">
			<Notice
				variant="info"
				title={ __( 'Welcome to the new dashboard' ) }
				onClose={ () => setIsDismissed( true ) }
				actions={
					<Button variant="primary" __next40pxDefaultSize onClick={ openTour }>
						{ __( 'Take the tour' ) }
					</Button>
				}
			>
				{ isOwner
					? __(
							'Your sites, purchases, and earnings are all here now. Plugins and Billing open in WordPress.com, and Amplify and Reports stay in the previous dashboard. You can switch back in Agency > Dashboard.'
						)
					: __(
							'Your agency switched to the new dashboard. Plugins and Billing open in WordPress.com, and Amplify and Reports stay in the previous dashboard. Your agency owner can switch back in Agency > Dashboard.'
						) }
			</Notice>
		</div>
	);
}
