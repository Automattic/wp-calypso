import { formatCurrency } from '@automattic/number-formatters';
import { __ } from '@wordpress/i18n';
import { Stat } from 'calypso/dashboard/components/stat';
import getCurrentAgencyTier from '../lib/get-current-agency-tier';
import type { AgencyTierType } from './types';

export default function InfluencedRevenue( {
	currentAgencyTierId,
	totalInfluencedRevenue,
}: {
	currentAgencyTierId?: AgencyTierType;
	totalInfluencedRevenue: number;
} ) {
	const currentTier = getCurrentAgencyTier( currentAgencyTierId );

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
