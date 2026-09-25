import { Card, CardBody, Button, __experimentalVStack as VStack } from '@wordpress/components';
import { useCallback } from 'react';
import {
	A4A_PARTNER_DIRECTORY_DASHBOARD_LINK,
	A4A_PURCHASES_LINK,
	A4A_REFERRALS_DASHBOARD,
	A4A_SITES_LINK,
	A4A_WOOPAYMENTS_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { A4A_REPORTS_LINK } from 'calypso/a8c-for-agencies/sections/reports/constants';
import TierBenefits from 'calypso/dashboard/agency/tiers/tier-benefits';
import TierCards from 'calypso/dashboard/agency/tiers/tier-cards';
import Divider from 'calypso/dashboard/components/divider';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import useScheduleCall from '../../../hooks/use-schedule-call';
import DownloadBadges from '../download-badges';
import InfluencedRevenue from './influenced-revenue';
import type { AgencyTierType, TierBenefitLinks } from 'calypso/dashboard/agency/tiers/types';
import type { AgencyTierStatus } from 'calypso/state/a8c-for-agencies/types';
import type { ComponentProps } from 'react';

const CONTACT_SUPPORT_URL = '#contact-support';

const BENEFIT_LINKS: TierBenefitLinks = {
	'manage-sites': A4A_SITES_LINK,
	'create-client-reports': A4A_REPORTS_LINK,
	'manage-purchases': A4A_PURCHASES_LINK,
	'make-client-referral': A4A_REFERRALS_DASHBOARD,
	'add-woopayments-to-store': A4A_WOOPAYMENTS_LINK,
	'contact-support': CONTACT_SUPPORT_URL,
	'manage-profile': A4A_PARTNER_DIRECTORY_DASHBOARD_LINK,
};

export default function AgencyTierOverviewContent( {
	currentAgencyTierId,
	totalInfluencedRevenue,
	tierStatus,
}: {
	currentAgencyTierId?: AgencyTierType;
	totalInfluencedRevenue: number;
	tierStatus?: AgencyTierStatus;
} ) {
	const dispatch = useDispatch();
	const { scheduleCall, isLoading } = useScheduleCall();

	const recordTracks = useCallback(
		( eventName: string, properties?: Record< string, unknown > ) => {
			dispatch( recordTracksEvent( eventName, properties ) );
		},
		[ dispatch ]
	);

	return (
		<VStack spacing={ 6 }>
			<Card>
				<CardBody>
					<InfluencedRevenue
						currentAgencyTierId={ currentAgencyTierId }
						totalInfluencedRevenue={ totalInfluencedRevenue }
					/>
				</CardBody>
			</Card>
			<TierCards
				currentAgencyTierId={ currentAgencyTierId }
				tierStatus={ tierStatus }
				recordTracksEvent={ recordTracks }
			/>
			<Divider style={ { color: 'var(--color-gray-100)', marginBlock: '16px' } } />
			<TierBenefits
				currentAgencyTierId={ currentAgencyTierId }
				recordTracksEvent={ recordTracks }
				onScheduleCall={ scheduleCall }
				isSchedulingCall={ isLoading }
				links={ BENEFIT_LINKS }
				shouldUseRouterLink={ false }
				renderDownloadBadges={ ( buttonProps: ComponentProps< typeof Button > ) => (
					<DownloadBadges buttonProps={ { ...buttonProps, icon: null } } />
				) }
			/>
		</VStack>
	);
}
