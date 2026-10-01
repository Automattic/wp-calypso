import { activeAgencyQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../app/analytics';
import { useLocale } from '../../app/locale';
import FlashMessage from '../../components/flash-message';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { getMarketplaceHostingSectionRoute } from '../marketplace/paths';
import { PARTNER_DIRECTORY_ROUTE } from '../partner-directory/paths';
import { useContactSupport } from '../support/use-contact-support';
import { useScheduleCall } from '../tiers/use-schedule-call';
import { PROGRAM_INCENTIVES_URL } from './constants';
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
	const hasPartnerDirectoryListing =
		!! agency?.profile?.partner_directory_application?.directories.some(
			( { status } ) => status === 'approved'
		);
	const { scheduleCall, isLoading: isSchedulingCall } = useScheduleCall( agency?.id );
	const { isEligibleForPressableIntroOffer, isEligibleForPressableExpansionOffer } =
		usePressableOfferEligibility( agency );

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
		>
			<FlashMessage
				id="route-not-allowed"
				type="error"
				message={ __( 'You don’t have permission to view the requested page.' ) }
			/>
			<AgencyOverviewContent
				agencyId={ agencyId }
				tierId={ agency.tier?.id }
				influencedRevenue={ agency.influenced_revenue ?? 0 }
				approvalStatus={ approvalStatus }
				capabilities={ agency.user?.capabilities }
				hasPartnerDirectoryListing={ hasPartnerDirectoryListing }
				isEligibleForPressableIntroOffer={ isEligibleForPressableIntroOffer }
				isEligibleForPressableExpansionOffer={ isEligibleForPressableExpansionOffer }
				links={ {
					tiers: '/tiers',
					sites: '/sites',
					referrals: '/referrals',
					woopayments: '/woopayments',
					marketplace: '/marketplace',
					partnerDirectory: PARTNER_DIRECTORY_ROUTE,
					aiMcp: '/agency/ai',
					pressableHosting: getMarketplaceHostingSectionRoute( 'pressable' ),
					helpful: [
						{
							id: 'contact-support',
							label: __( 'Contact sales & support' ),
							onClick: () => openContactForm(),
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
				onContactSupport={ () => openContactForm() }
				recordTracksEvent={ recordTracksEvent }
			/>
		</PageLayout>
	);
}
