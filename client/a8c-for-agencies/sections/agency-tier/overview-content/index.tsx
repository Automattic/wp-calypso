import {
	Card,
	CardBody,
	Button,
	__experimentalVStack as VStack,
	__experimentalDivider as Divider,
} from '@wordpress/components';
import { useCallback } from 'react';
import TierBenefits from 'calypso/dashboard/agency/tiers/tier-benefits';
import TierCards from 'calypso/dashboard/agency/tiers/tier-cards';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import useScheduleCall from '../../../hooks/use-schedule-call';
import DownloadBadges from '../download-badges';
import InfluencedRevenue from './influenced-revenue';
import type { AgencyTierType } from 'calypso/dashboard/agency/tiers/types';
import type { AgencyTierStatus } from 'calypso/state/a8c-for-agencies/types';
import type { ComponentProps } from 'react';

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
			<Divider orientation="horizontal" margin={ 4 } style={ { color: 'var(--color-gray-100)' } } />
			<TierBenefits
				currentAgencyTierId={ currentAgencyTierId }
				recordTracksEvent={ recordTracks }
				onScheduleCall={ scheduleCall }
				isSchedulingCall={ isLoading }
				renderDownloadBadges={ ( buttonProps: ComponentProps< typeof Button > ) => (
					<DownloadBadges buttonProps={ { ...buttonProps, icon: null } } />
				) }
			/>
		</VStack>
	);
}
