import { __ } from '@wordpress/i18n';
import { comment } from '@wordpress/icons';
import OverviewCard from '../overview-card';
import TrendComparisonBadge from './trend-comparizon-badge';
import type { EngagementStats } from '../../data/types';

export default function CommentsCard( { engagementStats }: { engagementStats: EngagementStats } ) {
	const { currentData, previousData } = engagementStats;
	return (
		<OverviewCard
			title={ __( 'Comments' ) }
			icon={ comment }
			heading={ `${ currentData.comments }` }
			metaText={ __( 'Past 7 days' ) }
			isLink
		>
			<TrendComparisonBadge
				count={ currentData.comments }
				previousCount={ previousData.comments }
			/>
		</OverviewCard>
	);
}
