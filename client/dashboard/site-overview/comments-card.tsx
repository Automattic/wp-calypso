import { __ } from '@wordpress/i18n';
import { comment } from '@wordpress/icons';
import OverviewCard from '../overview-card';
import TrendComparisonBadge from './trend-comparizon-badge';
import type { EngagementStats } from '../data/types';

export default function CommentsCard( { engagementStats }: { engagementStats: EngagementStats } ) {
	const { comments } = engagementStats;
	return (
		<OverviewCard
			title={ __( 'Comments' ) }
			icon={ comment }
			heading={ `${ comments.current }` }
			metaText={ __( 'Past 7 days' ) }
			isLink
		>
			<TrendComparisonBadge count={ comments.current } previousCount={ comments.previous } />
		</OverviewCard>
	);
}
