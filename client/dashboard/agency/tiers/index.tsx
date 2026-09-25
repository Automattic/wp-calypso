import { activeAgencyQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../app/analytics';
import { Card, CardBody } from '../../components/card';
import Divider from '../../components/divider';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { a4aLink } from '../../utils/link';
import { PARTNER_DIRECTORY_ROUTE } from '../partner-directory/paths';
import DownloadBadges from './download-badges';
import InfluencedRevenue from './influenced-revenue';
import TierBenefits from './tier-benefits';
import TierCards from './tier-cards';
import { useScheduleCall } from './use-schedule-call';
import type { TierBenefitLinks } from './types';

// TODO: the MSD dashboard has no contact-support entry point yet (A4A-3422). This
// matches the placeholder on the Overview screen — wire both up together.
const CONTACT_SUPPORT_URL = '#contact-support';

// Client reports are not part of the MSD; the classic dashboard keeps them.
const BENEFIT_LINKS: TierBenefitLinks = {
	'manage-sites': '/sites',
	'create-client-reports': a4aLink( '/reports' ),
	'manage-purchases': '/marketplace/purchases',
	'make-client-referral': '/earn/referrals',
	'add-woopayments-to-store': '/earn/woopayments',
	'contact-support': CONTACT_SUPPORT_URL,
	'manage-profile': PARTNER_DIRECTORY_ROUTE,
};

export default function AgencyTiers() {
	const { data: agency } = useQuery( activeAgencyQuery() );
	const { recordTracksEvent } = useAnalytics();
	const { scheduleCall, isLoading: isSchedulingCall } = useScheduleCall( agency?.id );

	if ( ! agency ) {
		return <PageLayout header={ <PageHeader title={ __( 'Tiers' ) } /> } />;
	}

	const currentAgencyTierId = agency.tier?.id;
	const tierStatus = agency.tier?.status;
	const totalInfluencedRevenue = agency.influenced_revenue ?? 0;
	const partnerDirectories = agency.partner_directory?.directories ?? [];

	const handleScheduleCall = () => {
		recordTracksEvent( 'calypso_a4a_agency_tier_benefits_schedule_call_click', {
			agency_tier: currentAgencyTierId,
		} );
		scheduleCall();
	};

	return (
		<PageLayout header={ <PageHeader title={ __( 'Tiers' ) } /> }>
			<Card>
				<CardBody>
					<InfluencedRevenue
						currentAgencyTierId={ currentAgencyTierId }
						totalInfluencedRevenue={ totalInfluencedRevenue }
						recordTracksEvent={ recordTracksEvent }
					/>
				</CardBody>
			</Card>
			<TierCards
				currentAgencyTierId={ currentAgencyTierId }
				tierStatus={ tierStatus }
				recordTracksEvent={ recordTracksEvent }
			/>
			<Divider style={ { color: 'var(--color-gray-100)' } } />
			<TierBenefits
				currentAgencyTierId={ currentAgencyTierId }
				recordTracksEvent={ recordTracksEvent }
				onScheduleCall={ handleScheduleCall }
				isSchedulingCall={ isSchedulingCall }
				links={ BENEFIT_LINKS }
				renderDownloadBadges={ ( buttonProps ) => (
					<DownloadBadges
						directories={ partnerDirectories }
						currentAgencyTierId={ currentAgencyTierId }
						recordTracksEvent={ recordTracksEvent }
						buttonProps={ buttonProps }
					/>
				) }
			/>
		</PageLayout>
	);
}
