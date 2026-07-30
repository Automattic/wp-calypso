import { __ } from '@wordpress/i18n';
import { useCallback } from 'react';
import { CONTACT_URL_HASH_FRAGMENT } from 'calypso/a8c-for-agencies/components/a4a-contact-support-widget';
import { ONBOARDING_TOUR_HASH } from 'calypso/a8c-for-agencies/components/hoc/with-onboarding-tour/hooks/use-onboarding-tour';
import {
	A4A_AGENCY_TIER_LINK,
	A4A_REFERRALS_DASHBOARD,
	A4A_WOOPAYMENTS_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import useScheduleCall from 'calypso/a8c-for-agencies/hooks/use-schedule-call';
import { PROGRAM_INCENTIVES_URL } from 'calypso/dashboard/agency/overview/constants';
import AgencyOverviewContent from 'calypso/dashboard/agency/overview/overview-content';
import { useDispatch, useSelector } from 'calypso/state';
import {
	getActiveAgency,
	getActiveAgencyId,
} from 'calypso/state/a8c-for-agencies/agency/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

export default function DashboardOverviewBody() {
	const dispatch = useDispatch();
	const agency = useSelector( getActiveAgency );
	const agencyId = useSelector( getActiveAgencyId );
	const approvalStatus = agency?.approval_status;

	const { scheduleCall, isLoading: isSchedulingCall } = useScheduleCall();

	const handleRecordTracksEvent = useCallback(
		( eventName: string, properties?: Record< string, unknown > ) => {
			dispatch( recordTracksEvent( eventName, properties ) );
		},
		[ dispatch ]
	);

	if ( ! agency ) {
		return null;
	}

	return (
		<AgencyOverviewContent
			agencyId={ agencyId ?? 0 }
			tierId={ agency.tier?.id }
			influencedRevenue={ agency.influenced_revenue ?? 0 }
			approvalStatus={ approvalStatus }
			capabilities={ agency.user?.capabilities }
			links={ {
				tiers: A4A_AGENCY_TIER_LINK,
				referrals: A4A_REFERRALS_DASHBOARD,
				woopayments: A4A_WOOPAYMENTS_LINK,
				contactSupport: CONTACT_URL_HASH_FRAGMENT,
				helpful: [
					{
						id: 'contact-support',
						label: __( 'Contact sales & support' ),
						href: CONTACT_URL_HASH_FRAGMENT,
					},
					{
						id: 'relaunch-welcome-tour',
						label: __( 'Relaunch welcome tour' ),
						onClick: () => {
							window.location.hash = ONBOARDING_TOUR_HASH;
						},
					},
					{
						id: 'program-incentives',
						label: __( 'Program incentive details' ),
						href: PROGRAM_INCENTIVES_URL,
						isExternal: true,
					},
				],
			} }
			shouldUseRouterLink={ false }
			onScheduleCall={ scheduleCall }
			isSchedulingCall={ isSchedulingCall }
			onRelaunchTour={ () => {
				window.location.hash = ONBOARDING_TOUR_HASH;
			} }
			recordTracksEvent={ handleRecordTracksEvent }
		/>
	);
}
