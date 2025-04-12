import { TrendComparison } from '@automattic/components/src/highlight-cards/count-comparison-card';
import { __ } from '@wordpress/i18n';
import { starEmpty } from '@wordpress/icons';
import OverviewCard from '../overview-card';
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
			<div className="site-overview-card__badge">
				<TrendComparison count={ currentData.likes } previousCount={ previousData.likes } />
			</div>
		</OverviewCard>
	);
}
