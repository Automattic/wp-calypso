import { TrendComparison } from '@automattic/components/src/highlight-cards/count-comparison-card';
import { __ } from '@wordpress/i18n';
import { comment } from '@wordpress/icons';
import OverviewCard from './overview-card';
import type { EngagementStats } from '../data/types';

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
			<div className="site-overview-card__badge">
				<TrendComparison count={ currentData.comments } previousCount={ previousData.comments } />
			</div>
		</OverviewCard>
	);
}
