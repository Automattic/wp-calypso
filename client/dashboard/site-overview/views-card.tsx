import { __ } from '@wordpress/i18n';
import { seen } from '@wordpress/icons';
import OverviewCard from '../overview-card';
import TrendComparisonBadge from './trend-comparizon-badge';
import type { EngagementStats } from '../data/types';

export default function ViewsCard( { engagementStats }: { engagementStats: EngagementStats } ) {
	const { currentData, previousData } = engagementStats;
	return (
		<OverviewCard
			title={ __( 'Views' ) }
			icon={ seen }
			heading={ `${ currentData.views }` }
			metaText={ __( 'Past 7 days' ) }
			isLink
		>
			<TrendComparisonBadge count={ currentData.views } previousCount={ previousData.views } />
		</OverviewCard>
	);
}
