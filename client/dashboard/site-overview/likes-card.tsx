import { __ } from '@wordpress/i18n';
import { starEmpty } from '@wordpress/icons';
import OverviewCard from '../overview-card';
import TrendComparisonBadge from './trend-comparizon-badge';
import type { EngagementStats } from '../data/types';

export default function LikesCard( { engagementStats }: { engagementStats: EngagementStats } ) {
	const { likes } = engagementStats;
	return (
		<OverviewCard
			title={ __( 'Likes' ) }
			icon={ starEmpty }
			heading={ `${ likes.current }` }
			metaText={ __( 'Past 7 days' ) }
			isLink
		>
			<TrendComparisonBadge count={ likes.current } previousCount={ likes.previous } />
		</OverviewCard>
	);
}
