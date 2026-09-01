import { __ } from '@wordpress/i18n';
import { useCallback } from 'react';
import { CONTACT_URL_HASH_FRAGMENT } from 'calypso/a8c-for-agencies/components/a4a-contact-support-widget';
import useIsEligibleForExpansionOffer from 'calypso/a8c-for-agencies/components/a4a-pressable-offer/hooks/use-is-eligible-for-expansion-offer';
import usePressableOfferEligibility from 'calypso/a8c-for-agencies/components/a4a-pressable-offer/hooks/use-pressable-offer-eligibility';
import { ONBOARDING_TOUR_HASH } from 'calypso/a8c-for-agencies/components/hoc/with-onboarding-tour/hooks/use-onboarding-tour';
import {
	A4A_AGENCY_TIER_LINK,
	A4A_MARKETPLACE_PRODUCTS_LINK,
	A4A_PARTNER_DIRECTORY_DASHBOARD_LINK,
	A4A_REFERRALS_DASHBOARD,
	A4A_SITES_LINK,
	A4A_WOOPAYMENTS_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import useScheduleCall from 'calypso/a8c-for-agencies/hooks/use-schedule-call';
import { PROGRAM_INCENTIVES_URL } from 'calypso/dashboard/agency/overview/constants';
import AgencyOverviewContent from 'calypso/dashboard/agency/overview/overview-content';
import { useDispatch, useSelector } from 'calypso/state';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

function DashboardOverviewBodyContent( {
	isEligibleForPressableExpansionOffer,
}: {
	isEligibleForPressableExpansionOffer: boolean;
} ) {
	const dispatch = useDispatch();
	const agency = useSelector( getActiveAgency );
	const approvalStatus = agency?.approval_status;
	const { isEligibleForIntroductoryOffer } = usePressableOfferEligibility();
	const hasPartnerDirectoryListing =
		!! agency?.profile?.partner_directory_application?.directories.some(
			( { status } ) => status === 'approved'
		);

	const { scheduleCall, isLoading: isSchedulingCall } = useScheduleCall();

	const handleRecordTracksEvent = useCallback(
		( eventName: string, properties?: Record< string, unknown > ) => {
			dispatch( recordTracksEvent( eventName, properties ) );
		},
		[ dispatch ]
	);

	const handleRelaunchTour = useCallback( () => {
		window.location.hash = ONBOARDING_TOUR_HASH;
	}, [] );

	if ( ! agency ) {
		return null;
	}

	return (
		<AgencyOverviewContent
			agencyId={ agency.id }
			tierId={ agency.tier?.id }
			influencedRevenue={ agency.influenced_revenue ?? 0 }
			approvalStatus={ approvalStatus }
			capabilities={ agency.user?.capabilities }
			hasPartnerDirectoryListing={ hasPartnerDirectoryListing }
			isEligibleForPressableIntroOffer={ isEligibleForIntroductoryOffer }
			isEligibleForPressableExpansionOffer={ isEligibleForPressableExpansionOffer }
			links={ {
				tiers: A4A_AGENCY_TIER_LINK,
				sites: A4A_SITES_LINK,
				referrals: A4A_REFERRALS_DASHBOARD,
				woopayments: A4A_WOOPAYMENTS_LINK,
				marketplace: A4A_MARKETPLACE_PRODUCTS_LINK,
				partnerDirectory: A4A_PARTNER_DIRECTORY_DASHBOARD_LINK,
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
						onClick: handleRelaunchTour,
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
			onRelaunchTour={ handleRelaunchTour }
			recordTracksEvent={ handleRecordTracksEvent }
		/>
	);
}

function ContentWithExpansionOfferCheck() {
	const isEligibleForExpansionOffer = useIsEligibleForExpansionOffer();

	return (
		<DashboardOverviewBodyContent
			isEligibleForPressableExpansionOffer={ isEligibleForExpansionOffer }
		/>
	);
}

export default function DashboardOverviewBody() {
	const { mayBeEligibleForExpansionOffer } = usePressableOfferEligibility();

	// Gate before rendering so the license fetch behind the expansion offer
	// check only runs for agencies that own a Pressable plan through A4A.
	if ( mayBeEligibleForExpansionOffer ) {
		return <ContentWithExpansionOfferCheck />;
	}

	return <DashboardOverviewBodyContent isEligibleForPressableExpansionOffer={ false } />;
}
