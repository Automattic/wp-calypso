import { Card, CardBody, __experimentalVStack as VStack } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import InfluencedRevenue from './influenced-revenue';
import TierCards from './tier-cards';
import type { AgencyTier } from './types';

export default function AgencyTierOverviewContent( {
	currentAgencyTier,
	totalInfluencedRevenue,
}: {
	currentAgencyTier?: AgencyTier;
	totalInfluencedRevenue: number;
} ) {
	const isSmallViewport = useViewportMatch( 'huge', '<' );

	return (
		<VStack spacing={ 6 }>
			<Card>
				<CardBody>
					<InfluencedRevenue
						currentAgencyTier={ currentAgencyTier }
						totalInfluencedRevenue={ totalInfluencedRevenue }
					/>
				</CardBody>
			</Card>
			<TierCards currentAgencyTier={ currentAgencyTier } isSmallViewport={ isSmallViewport } />
		</VStack>
	);
}
