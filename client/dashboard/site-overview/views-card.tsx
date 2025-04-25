import { __ } from '@wordpress/i18n';
import { seen } from '@wordpress/icons';
import OverviewCard from '../overview-card';
import TrendComparisonBadge from './trend-comparizon-badge';
import type { EngagementStats } from '../data/types';

export default function ViewsCard( { engagementStats }: { engagementStats: EngagementStats } ) {
	const { views } = engagementStats;
	return (
		<OverviewCard
			title={ __( 'Views' ) }
			icon={ seen }
			heading={ `${ views.current }` }
			metaText={ __( 'Past 7 days' ) }
			isLink
		>
			<TrendComparisonBadge count={ views.current } previousCount={ views.previous } />
		</OverviewCard>
	);
}
