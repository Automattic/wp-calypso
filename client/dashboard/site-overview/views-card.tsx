import { TrendComparison } from '@automattic/components/src/highlight-cards/count-comparison-card';
import { __ } from '@wordpress/i18n';
import { seen } from '@wordpress/icons';
import OverviewCard from './overview-card';
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
			<div className="site-overview-card__badge">
				<TrendComparison count={ currentData.views } previousCount={ previousData.views } />
			</div>
		</OverviewCard>
	);
}
