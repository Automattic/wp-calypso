import { activeAgencyQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __experimentalDivider as Divider } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../app/analytics';
import { Card, CardBody } from '../../components/card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import InfluencedRevenue from './influenced-revenue';
import TierBenefits from './tier-benefits';
import TierCards from './tier-cards';
import { useScheduleCall } from './use-schedule-call';

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
			<Divider />
			<TierBenefits
				currentAgencyTierId={ currentAgencyTierId }
				recordTracksEvent={ recordTracksEvent }
				onScheduleCall={ handleScheduleCall }
				isSchedulingCall={ isSchedulingCall }
			/>
		</PageLayout>
	);
}
