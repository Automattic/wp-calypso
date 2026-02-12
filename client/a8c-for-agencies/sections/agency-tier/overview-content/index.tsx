import {
	Card,
	CardBody,
	__experimentalVStack as VStack,
	__experimentalDivider as Divider,
} from '@wordpress/components';
import InfluencedRevenue from './influenced-revenue';
import TierBenefits from './tier-benefits';
import TierCards from './tier-cards';
import type { AgencyTierType } from './types';
import type { AgencyTierStatus } from 'calypso/state/a8c-for-agencies/types';

import './style.scss';

export default function AgencyTierOverviewContent( {
	currentAgencyTierId,
	totalInfluencedRevenue,
	tierStatus,
}: {
	currentAgencyTierId?: AgencyTierType;
	totalInfluencedRevenue: number;
	tierStatus?: AgencyTierStatus;
} ) {
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
			<TierCards currentAgencyTierId={ currentAgencyTierId } tierStatus={ tierStatus } />
			<Divider orientation="horizontal" margin={ 4 } style={ { color: '#F0F0F0' } } />
			<TierBenefits currentAgencyTierId={ currentAgencyTierId } />
		</VStack>
	);
}
