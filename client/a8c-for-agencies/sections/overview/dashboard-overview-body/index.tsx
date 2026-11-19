import { __ } from '@wordpress/i18n';
import { useCallback } from 'react';
import { CONTACT_URL_HASH_FRAGMENT } from 'calypso/a8c-for-agencies/components/a4a-contact-support-widget';
import { getDashboardOptInLink } from 'calypso/a8c-for-agencies/components/dashboard-opt-in-modal';
import { ONBOARDING_TOUR_HASH } from 'calypso/a8c-for-agencies/components/hoc/with-onboarding-tour/hooks/use-onboarding-tour';
import {
	A4A_AGENCY_TIER_LINK,
	A4A_MARKETPLACE_PRODUCTS_LINK,
	A4A_PARTNER_DIRECTORY_DASHBOARD_LINK,
	A4A_PARTNER_DIRECTORY_LINK,
	A4A_REFERRALS_DASHBOARD,
	A4A_SITES_LINK,
	A4A_WOOPAYMENTS_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import useLeadMatchingProfile from 'calypso/a8c-for-agencies/data/partner-directory/use-lead-matching-profile';
import useDashboardOptIn from 'calypso/a8c-for-agencies/hooks/use-dashboard-opt-in';
import useScheduleCall from 'calypso/a8c-for-agencies/hooks/use-schedule-call';
import { PARTNER_DIRECTORY_LEAD_MATCHING_SLUG } from 'calypso/a8c-for-agencies/sections/partner-directory/constants';
import { PROGRAM_INCENTIVES_URL } from 'calypso/dashboard/agency/overview/constants';
import { getAnsweredMatchingProfileCount } from 'calypso/dashboard/agency/overview/matching-profile-visibility';
import AgencyOverviewContent from 'calypso/dashboard/agency/overview/overview-content';
import { REQUIRED_LEAD_MATCHING_FIELDS } from 'calypso/dashboard/agency/partner-directory/lead-matching/form-data';
import { isProPartnerOrHigher } from 'calypso/dashboard/agency/tiers/get-current-agency-tier';
import { useDispatch, useSelector } from 'calypso/state';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

export default function DashboardOverviewBody() {
	const dispatch = useDispatch();
	const agency = useSelector( getActiveAgency );
	const agencyId = agency?.id ?? 0;
	const approvalStatus = agency?.approval_status;
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

	const { scheduleCall, isLoading: isSchedulingCall } = useScheduleCall();
	const { canOptIn } = useDashboardOptIn();

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
			showMatchingProfileCard={
				canAccessLeadMatching &&
				agency.profile?.listing_details?.is_available === true &&
				answeredRequiredFieldCount !== undefined &&
				answeredRequiredFieldCount < REQUIRED_LEAD_MATCHING_FIELDS.length
			}
			showContactOptionsAnnouncement={
				canAccessLeadMatching &&
				answeredRequiredFieldCount === REQUIRED_LEAD_MATCHING_FIELDS.length &&
				( ! contact?.phone?.trim() || ! contact?.booking_link?.trim() )
			}
			matchingProfileAnswered={ answeredRequiredFieldCount }
			links={ {
				tiers: A4A_AGENCY_TIER_LINK,
				sites: A4A_SITES_LINK,
				referrals: A4A_REFERRALS_DASHBOARD,
				woopayments: A4A_WOOPAYMENTS_LINK,
				marketplace: A4A_MARKETPLACE_PRODUCTS_LINK,
				partnerDirectory: A4A_PARTNER_DIRECTORY_DASHBOARD_LINK,
				leadMatching: `${ A4A_PARTNER_DIRECTORY_LINK }/${ PARTNER_DIRECTORY_LEAD_MATCHING_SLUG }`,
				contactSupport: CONTACT_URL_HASH_FRAGMENT,
				helpful: [
					...( canOptIn
						? [
								{
									id: 'switch-to-new-dashboard',
									label: __( 'Enable the new dashboard' ),
									badge: __( 'Beta' ),
									href: getDashboardOptInLink( 'helpful-links' ),
								},
							]
						: [] ),
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
			recordTracksEvent={ handleRecordTracksEvent }
		/>
	);
}
