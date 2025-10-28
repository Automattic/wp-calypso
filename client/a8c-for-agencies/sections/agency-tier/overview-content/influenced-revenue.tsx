import { formatCurrency } from '@automattic/number-formatters';
import { __ } from '@wordpress/i18n';
import { Stat } from 'calypso/dashboard/components/stat';
import { ALL_TIERS } from './constants';
import type { AgencyTier } from './types';

export default function InfluencedRevenue( {
	currentAgencyTier,
	totalInfluencedRevenue,
}: {
	currentAgencyTier?: AgencyTier;
	totalInfluencedRevenue: number;
} ) {
	const currentTier = ALL_TIERS.find( ( tier ) => tier.id === currentAgencyTier );

	if ( ! currentTier ) {
		return null;
	}

	const progressValue = Math.round(
		( totalInfluencedRevenue / currentTier.influencedRevenue ) * 100
	);

	return (
		<Stat
			density="high"
			strapline={ __( 'Influenced revenue' ) }
			metric={ formatCurrency( totalInfluencedRevenue, 'USD' ) }
			description={ formatCurrency( currentTier.influencedRevenue, 'USD' ) }
			progressValue={ progressValue }
			progressLabel={ `${ progressValue }%` }
		/>
	);
}
