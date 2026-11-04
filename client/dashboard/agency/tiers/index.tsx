import { activeAgencyQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../app/analytics';
import { Card, CardBody } from '../../components/card';
import Divider from '../../components/divider';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { NEW_REPORT_PARAM } from '../amplify/constants';
import { useProspectReportsBenefit } from '../amplify/use-prospect-reports-benefit';
import CertificationTierPageCard from '../certification/tier-page-card';
import { PARTNER_DIRECTORY_ROUTE } from '../partner-directory/paths';
import { useContactSupport } from '../support/use-contact-support';
import DownloadBadges from './download-badges';
import InfluencedRevenue from './influenced-revenue';
import TierBenefits from './tier-benefits';
import TierCards from './tier-cards';
import { useScheduleCall } from './use-schedule-call';
import type { TierBenefitLinks } from './types';

const BENEFIT_LINKS: TierBenefitLinks = {
	'manage-sites': '/sites',
	'manage-purchases': '/purchases',
	'make-client-referral': '/referrals',
	'add-woopayments-to-store': '/woopayments',
	'manage-profile': PARTNER_DIRECTORY_ROUTE,
};

const BENEFIT_LINKS_WITH_AMPLIFY: TierBenefitLinks = {
	...BENEFIT_LINKS,
	'generate-prospect-report': `/prospect-reports?${ NEW_REPORT_PARAM }=1`,
};

const BENEFIT_LINKS_WITH_AMPLIFY_REPORTS: TierBenefitLinks = {
	...BENEFIT_LINKS_WITH_AMPLIFY,
	'view-prospect-reports': '/prospect-reports',
};

function getBenefitLinks( hasProspectReports: boolean, hasReports: boolean ) {
	if ( ! hasProspectReports ) {
		return BENEFIT_LINKS;
	}
	return hasReports ? BENEFIT_LINKS_WITH_AMPLIFY_REPORTS : BENEFIT_LINKS_WITH_AMPLIFY;
}

export default function AgencyTiers() {
	const { data: agency } = useQuery( activeAgencyQuery() );
	const { recordTracksEvent } = useAnalytics();
	const { openContactForm } = useContactSupport();
	const { scheduleCall, isLoading: isSchedulingCall } = useScheduleCall( agency?.id );
	const hasProspectReports = !! agency?.amplify?.allowed;
	const prospectReports = useProspectReportsBenefit( {
		agencyId: agency?.id,
		allowed: hasProspectReports,
	} );

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
			<CertificationTierPageCard recordTracksEvent={ recordTracksEvent } />
			<TierBenefits
				currentAgencyTierId={ currentAgencyTierId }
				recordTracksEvent={ recordTracksEvent }
				onScheduleCall={ handleScheduleCall }
				isSchedulingCall={ isSchedulingCall }
				onContactSupport={ () => openContactForm() }
				links={ getBenefitLinks( hasProspectReports, prospectReports.hasReports ) }
				prospectReports={ prospectReports }
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
