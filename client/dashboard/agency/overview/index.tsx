import { activeAgencyQuery, agencyLeadMatchingQuery } from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../app/analytics';
import { useLocale } from '../../app/locale';
import FlashMessage from '../../components/flash-message';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { AgencyNotices } from '../components/agency-notices';
import PaymentRiskNotice, { hasPaymentRiskNotice } from '../components/payment-risk-notice';
import PressableUsageLimitNotice, {
	usePressableUsageLimit,
} from '../components/pressable-usage-limit-notice';
import MissingPaymentSettingsNotice, {
	useMissingPaymentSettings,
} from '../earn/missing-payment-settings-notice';
import { useHasCommissionActivity } from '../earn/use-has-commission-activity';
import { getMarketplaceHostingSectionRoute } from '../marketplace/paths';
import { useOnboardingTour } from '../onboarding-tour';
import WelcomeBand, { useWelcomeBandVisibility } from '../onboarding-tour/welcome-band';
import { REQUIRED_LEAD_MATCHING_FIELDS } from '../partner-directory/lead-matching/form-data';
import {
	PARTNER_DIRECTORY_LEAD_MATCHING_PREFERENCES_ROUTE,
	PARTNER_DIRECTORY_ROUTE,
} from '../partner-directory/paths';
import { useContactSupport } from '../support/use-contact-support';
import { isProPartnerOrHigher } from '../tiers/get-current-agency-tier';
import { useScheduleCall } from '../tiers/use-schedule-call';
import { PROGRAM_INCENTIVES_URL } from './constants';
import {
	getAnsweredMatchingProfileCount,
	hasIncompleteSavedMatchingProfile,
} from './matching-profile-visibility';
import AgencyOverviewContent from './overview-content';
import AgencyOverviewHeader from './overview-header';
import usePressableOfferEligibility from './use-pressable-offer-eligibility';

export default function AgencyOverview() {
	const { data: agency } = useQuery( activeAgencyQuery() );
	const { recordTracksEvent } = useAnalytics();
	const { openContactForm } = useContactSupport();
	const locale = useLocale();
	const agencyId = agency?.id ?? 0;
	const approvalStatus = agency?.approval_status;
	const isPending = approvalStatus === 'pending';
	const { isVisible: isWelcomeBandVisible, isLoading: isWelcomeBandLoading } =
		useWelcomeBandVisibility( approvalStatus, agency?.tier?.id, agency?.created_at );
	const { openTour } = useOnboardingTour();
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
	const { data: leadMatching, isSuccess: isLeadMatchingSuccess } = useQuery( {
		...agencyLeadMatchingQuery( agencyId ),
		enabled: canAccessLeadMatching,
	} );
	const answeredRequiredFieldCount = isLeadMatchingSuccess
		? getAnsweredMatchingProfileCount( agencyId, leadMatching )
		: undefined;
	const contact = leadMatching?.lead_matching_profile?.contact;
	const isLeadMatchingEnabled =
		isEnabled( 'a4a-lead-matching-design-preview' ) && canAccessLeadMatching;
	const { scheduleCall, isLoading: isSchedulingCall } = useScheduleCall( agency?.id );
	const { isEligibleForPressableIntroOffer, isEligibleForPressableExpansionOffer } =
		usePressableOfferEligibility( agency );
	const { hasActivity, isLoading: isLoadingActivity } = useHasCommissionActivity( agencyId );
	const pressableUsageLimit = usePressableUsageLimit( agency );
	const missingPaymentSettings = useMissingPaymentSettings( {
		hasCommissionActivity: hasActivity,
		isLoadingActivity,
	} );

	if ( ! agency ) {
		return <PageLayout header={ <PageHeader title={ __( 'Overview' ) } /> } />;
	}

	return (
		<PageLayout
			header={
				<AgencyOverviewHeader
					name={ agency.name }
					url={ agency.url }
					createdAt={ agency.created_at }
					locale={ locale }
				/>
			}
			notices={
				<AgencyNotices
					candidates={ [
						{
							id: 'payment-risk',
							isUrgent: true,
							isEligible: hasPaymentRiskNotice( agency ),
							notice: <PaymentRiskNotice agency={ agency } source="overview" />,
						},
						{
							id: 'pressable-usage-limit',
							...pressableUsageLimit,
							notice: <PressableUsageLimitNotice agency={ agency } />,
						},
						{
							id: 'missing-payment-settings',
							...missingPaymentSettings,
							notice: <MissingPaymentSettingsNotice hasCommissionActivity={ hasActivity } />,
						},
					] }
				/>
			}
		>
			<FlashMessage
				id="route-not-allowed"
				type="error"
				message={ __( 'You don’t have permission to view the requested page.' ) }
			/>
			{ isWelcomeBandVisible && (
				<WelcomeBand
					isPending={ isPending }
					sitesHref="/sites"
					marketplaceHref="/marketplace"
					onScheduleCall={ scheduleCall }
					isSchedulingCall={ isSchedulingCall }
					onTakeTour={ openTour }
					recordTracksEvent={ recordTracksEvent }
				/>
			) }
			<AgencyOverviewContent
				agencyId={ agencyId }
				tierId={ agency.tier?.id }
				influencedRevenue={ agency.influenced_revenue ?? 0 }
				approvalStatus={ approvalStatus }
				capabilities={ agency.user?.capabilities }
				hasPartnerDirectoryListing={ hasPartnerDirectoryListing }
				showMatchingProfilePreview={
					isLeadMatchingEnabled &&
					isLeadMatchingSuccess &&
					hasIncompleteSavedMatchingProfile( agencyId, leadMatching )
				}
				showContactOptionsAnnouncement={
					canAccessLeadMatching &&
					answeredRequiredFieldCount === REQUIRED_LEAD_MATCHING_FIELDS.length &&
					( ! contact?.phone?.trim() || ! contact?.booking_link?.trim() )
				}
				isEligibleForPressableIntroOffer={ isEligibleForPressableIntroOffer }
				isEligibleForPressableExpansionOffer={ isEligibleForPressableExpansionOffer }
				links={ {
					tiers: '/tiers',
					sites: '/sites',
					referrals: '/referrals',
					woopayments: '/woopayments',
					marketplace: '/marketplace',
					partnerDirectory: PARTNER_DIRECTORY_ROUTE,
					leadMatching: PARTNER_DIRECTORY_LEAD_MATCHING_PREFERENCES_ROUTE,
					contactSupport: () => openContactForm(),
					aiMcp: '/agency/ai',
					pressableHosting: getMarketplaceHostingSectionRoute( 'pressable' ),
					helpful: [
						{
							id: 'contact-support',
							label: __( 'Contact sales & support' ),
							onClick: () => openContactForm(),
						},
						{
							id: 'relaunch-welcome-tour',
							label: __( 'Take the full tour' ),
							onClick: openTour,
						},
						{
							id: 'program-incentives',
							label: __( 'Program incentive details' ),
							href: PROGRAM_INCENTIVES_URL,
							isExternal: true,
						},
					],
				} }
				onScheduleCall={ scheduleCall }
				isSchedulingCall={ isSchedulingCall }
				onRelaunchTour={ openTour }
				tourLabel={ __( 'Take the full tour' ) }
				hidesPendingCard={ isWelcomeBandVisible || isWelcomeBandLoading }
				partnerManager={ agency.partner_manager }
				recordTracksEvent={ recordTracksEvent }
			/>
		</PageLayout>
	);
}
