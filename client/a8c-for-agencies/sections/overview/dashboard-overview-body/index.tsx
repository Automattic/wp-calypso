import { isEnabled } from '@automattic/calypso-config';
import { __ } from '@wordpress/i18n';
import { useCallback } from 'react';
import { CONTACT_URL_HASH_FRAGMENT } from 'calypso/a8c-for-agencies/components/a4a-contact-support-widget';
import useIsEligibleForExpansionOffer from 'calypso/a8c-for-agencies/components/a4a-pressable-offer/hooks/use-is-eligible-for-expansion-offer';
import usePressableOfferEligibility from 'calypso/a8c-for-agencies/components/a4a-pressable-offer/hooks/use-pressable-offer-eligibility';
import { ONBOARDING_TOUR_HASH } from 'calypso/a8c-for-agencies/components/hoc/with-onboarding-tour/hooks/use-onboarding-tour';
import {
	A4A_AGENCY_TIER_LINK,
	A4A_AI_MCP_LINK,
	A4A_MARKETPLACE_HOSTING_PRESSABLE_LINK,
	A4A_MARKETPLACE_PRODUCTS_LINK,
	A4A_PARTNER_DIRECTORY_DASHBOARD_LINK,
	A4A_PARTNER_DIRECTORY_LINK,
	A4A_REFERRALS_DASHBOARD,
	A4A_SITES_LINK,
	A4A_WOOPAYMENTS_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import useLeadMatchingProfile from 'calypso/a8c-for-agencies/data/partner-directory/use-lead-matching-profile';
import useScheduleCall from 'calypso/a8c-for-agencies/hooks/use-schedule-call';
import { PARTNER_DIRECTORY_LEAD_MATCHING_SLUG } from 'calypso/a8c-for-agencies/sections/partner-directory/constants';
import {
	PRESSABLE_Q3_2026_OFFER_ENDS_AT,
	PROGRAM_INCENTIVES_URL,
} from 'calypso/dashboard/agency/overview/constants';
import {
	getAnsweredMatchingProfileCount,
	hasIncompleteSavedMatchingProfile,
} from 'calypso/dashboard/agency/overview/matching-profile-visibility';
import AgencyOverviewContent from 'calypso/dashboard/agency/overview/overview-content';
import { REQUIRED_LEAD_MATCHING_FIELDS } from 'calypso/dashboard/agency/partner-directory/lead-matching/form-data';
import { isProPartnerOrHigher } from 'calypso/dashboard/agency/tiers/get-current-agency-tier';
import { useDispatch, useSelector } from 'calypso/state';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { successNotice } from 'calypso/state/notices/actions';

function DashboardOverviewBodyContent( {
	isEligibleForPressableExpansionOffer,
}: {
	isEligibleForPressableExpansionOffer: boolean;
} ) {
	const dispatch = useDispatch();
	const agency = useSelector( getActiveAgency );
	const agencyId = agency?.id ?? 0;
	const approvalStatus = agency?.approval_status;
	const { isEligibleForIntroductoryOffer } = usePressableOfferEligibility();
	const hasPartnerDirectoryListing =
		!! agency?.profile?.partner_directory_application?.directories.some(
			( { status } ) => status === 'approved'
		);
	const canAccessLeadMatching =
		isProPartnerOrHigher( agency?.tier?.id ) &&
		!! agencyId &&
		!! agency?.partner_directory?.allowed &&
		!! agency?.user?.capabilities?.includes( 'a4a_read_partner_directory' ) &&
		hasPartnerDirectoryListing;
	const { data: leadMatching, isSuccess: isLeadMatchingSuccess } =
		useLeadMatchingProfile( canAccessLeadMatching );
	const answeredRequiredFieldCount = isLeadMatchingSuccess
		? getAnsweredMatchingProfileCount( agencyId, leadMatching )
		: undefined;
	const contact = leadMatching?.lead_matching_profile?.contact;
	const isLeadMatchingEnabled =
		isEnabled( 'a4a-lead-matching-design-preview' ) && canAccessLeadMatching;

	const { scheduleCall, isLoading: isSchedulingCall } = useScheduleCall();

	const handleRecordTracksEvent = useCallback(
		( eventName: string, properties?: Record< string, unknown > ) => {
			dispatch( recordTracksEvent( eventName, properties ) );
		},
		[ dispatch ]
	);

	const handleCertificationShareCopy = useCallback( () => {
		dispatch( successNotice( __( 'Message copied. Paste it into a chat or email.' ) ) );
	}, [ dispatch ] );

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
			showMatchingProfilePreview={
				isLeadMatchingEnabled &&
				isLeadMatchingSuccess &&
				hasIncompleteSavedMatchingProfile( agency.id, leadMatching )
			}
			showContactOptionsAnnouncement={
				canAccessLeadMatching &&
				answeredRequiredFieldCount === REQUIRED_LEAD_MATCHING_FIELDS.length &&
				( ! contact?.phone?.trim() || ! contact?.booking_link?.trim() )
			}
			isEligibleForPressableIntroOffer={ isEligibleForIntroductoryOffer }
			isEligibleForPressableExpansionOffer={ isEligibleForPressableExpansionOffer }
			links={ {
				tiers: A4A_AGENCY_TIER_LINK,
				sites: A4A_SITES_LINK,
				referrals: A4A_REFERRALS_DASHBOARD,
				woopayments: A4A_WOOPAYMENTS_LINK,
				marketplace: A4A_MARKETPLACE_PRODUCTS_LINK,
				partnerDirectory: A4A_PARTNER_DIRECTORY_DASHBOARD_LINK,
				leadMatching: `${ A4A_PARTNER_DIRECTORY_LINK }/${ PARTNER_DIRECTORY_LEAD_MATCHING_SLUG }`,
				contactSupport: CONTACT_URL_HASH_FRAGMENT,
				aiMcp: A4A_AI_MCP_LINK,
				pressableHosting: A4A_MARKETPLACE_HOSTING_PRESSABLE_LINK,
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
			partnerManager={ agency.partner_manager }
			onCertificationShareCopy={ handleCertificationShareCopy }
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
	// Once the offer ends the card can never render, so don't pay for the
	// license fetch either.
	const isOfferActive = new Date() < new Date( PRESSABLE_Q3_2026_OFFER_ENDS_AT );

	// Gate before rendering so the license fetch behind the expansion offer
	// check only runs for agencies that own a Pressable plan through A4A.
	if ( isOfferActive && mayBeEligibleForExpansionOffer ) {
		return <ContentWithExpansionOfferCheck />;
	}

	return <DashboardOverviewBodyContent isEligibleForPressableExpansionOffer={ false } />;
}
