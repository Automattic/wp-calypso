import { __ } from '@wordpress/i18n';
import { people } from '@wordpress/icons';
import OverviewCard from '../overview-card';
import TrendComparisonBadge from './trend-comparizon-badge';
import type { EngagementStats } from '../data/types';

export default function VisitorsCard( { engagementStats }: { engagementStats: EngagementStats } ) {
	const { currentData, previousData } = engagementStats;
	return (
		<OverviewCard
			title={ __( 'Visitors' ) }
			icon={ people }
			heading={ `${ currentData.visitors }` }
			metaText={ __( 'Past 7 days' ) }
			isLink
		>
			<TrendComparisonBadge
				count={ currentData.visitors }
				previousCount={ previousData.visitors }
			/>
		</OverviewCard>
	);
}
