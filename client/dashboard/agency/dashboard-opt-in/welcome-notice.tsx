import {
	activeAgencyQuery,
	userPreferenceOptimisticMutation,
	userPreferenceQuery,
} from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect, useRef } from 'react';
import { useAnalytics } from '../../app/analytics';
import { Notice } from '../../components/notice';
import { isOnNewAgencyDashboard } from '../lib/dashboard-opt-in';
import { useOnboardingTour } from '../onboarding-tour';
import { OWNER_ROLE } from '../team/constants';

const DISMISSED_PREFERENCE = 'a4a-dashboard-welcome-notice-dismissed';

/**
 * The first visit after the agency switches, on whichever agency page they land on first,
 * since links from the previous dashboard forward to the matching page.
 */
export function useWelcomeNoticeEligibility() {
	const { data: agency } = useQuery( activeAgencyQuery() );
	const isOptedIn = isOnNewAgencyDashboard( agency );
	const { data: isDismissed, isFetched } = useQuery( {
		...userPreferenceQuery( DISMISSED_PREFERENCE ),
		enabled: isOptedIn,
	} );

	return {
		isEligible: isOptedIn && isFetched && ! isDismissed,
		isLoading: isOptedIn && ! isFetched,
	};
}

export default function WelcomeNotice() {
	const { recordTracksEvent } = useAnalytics();
	const { data: agency } = useQuery( activeAgencyQuery() );
	const { openTour } = useOnboardingTour();
	const { mutate: saveDismissed } = useMutation(
		userPreferenceOptimisticMutation( DISMISSED_PREFERENCE )
	);
	const isOwner = agency?.user?.role === OWNER_ROLE;

	const hasRecordedView = useRef( false );
	useEffect( () => {
		if ( ! hasRecordedView.current ) {
			hasRecordedView.current = true;
			recordTracksEvent( 'calypso_a4a_dashboard_welcome_notice_view', { is_owner: isOwner } );
		}
	}, [ isOwner, recordTracksEvent ] );

	const handleTakeTour = () => {
		recordTracksEvent( 'calypso_a4a_dashboard_welcome_notice_tour_click' );
		saveDismissed( true );
		openTour();
	};

	const handleDismiss = () => {
		recordTracksEvent( 'calypso_a4a_dashboard_welcome_notice_dismiss' );
		saveDismissed( true );
	};

	return (
		<Notice
			variant="info"
			title={ __( 'Welcome to the new dashboard' ) }
			onClose={ handleDismiss }
			actions={
				<Button variant="primary" onClick={ handleTakeTour } __next40pxDefaultSize>
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
	);
}
