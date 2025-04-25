import { __ } from '@wordpress/i18n';
import { people } from '@wordpress/icons';
import OverviewCard from '../overview-card';
import TrendComparisonBadge from './trend-comparizon-badge';
import type { EngagementStats } from '../data/types';

export default function VisitorsCard( { engagementStats }: { engagementStats: EngagementStats } ) {
	const { visitors } = engagementStats;
	return (
		<OverviewCard
			title={ __( 'Visitors' ) }
			icon={ people }
			heading={ `${ visitors.current }` }
			metaText={ __( 'Past 7 days' ) }
			isLink
		>
			<TrendComparisonBadge count={ visitors.current } previousCount={ visitors.previous } />
		</OverviewCard>
	);
}
