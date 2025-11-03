import { Card, CardBody, __experimentalVStack as VStack } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import InfluencedRevenue from './influenced-revenue';
import TierCards from './tier-cards';
import type { AgencyTierType } from './types';

export default function AgencyTierOverviewContent( {
	currentAgencyTierId,
	totalInfluencedRevenue,
}: {
	currentAgencyTierId?: AgencyTierType;
	totalInfluencedRevenue: number;
} ) {
	const isSmallViewport = useViewportMatch( 'huge', '<' );

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
			<TierCards currentAgencyTierId={ currentAgencyTierId } isSmallViewport={ isSmallViewport } />
		</VStack>
	);
}
