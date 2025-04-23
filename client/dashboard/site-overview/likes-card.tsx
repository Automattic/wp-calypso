import { __ } from '@wordpress/i18n';
import { starEmpty } from '@wordpress/icons';
import OverviewCard from '../overview-card';
import TrendComparisonBadge from './trend-comparizon-badge';
import type { EngagementStats } from '../data/types';

export default function LikesCard( { engagementStats }: { engagementStats: EngagementStats } ) {
	const { currentData, previousData } = engagementStats;
	return (
		<OverviewCard
			title={ __( 'Likes' ) }
			icon={ starEmpty }
			heading={ `${ currentData.likes }` }
			metaText={ __( 'Past 7 days' ) }
			isLink
		>
			<TrendComparisonBadge count={ currentData.likes } previousCount={ previousData.likes } />
		</OverviewCard>
	);
}
