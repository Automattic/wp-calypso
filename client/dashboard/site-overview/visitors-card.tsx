import { TrendComparison } from '@automattic/components/src/highlight-cards/count-comparison-card';
import { __ } from '@wordpress/i18n';
import { people } from '@wordpress/icons';
import OverviewCard from './overview-card';
import type { FetchSiteRouteResponse } from '../data/types';

export default function VisitorsCard( { engagementStats }: FetchSiteRouteResponse ) {
	const { currentData, previousData } = engagementStats;
	return (
		<OverviewCard
			title={ __( 'Visitors' ) }
			icon={ people }
			heading={ `${ currentData.visitors }` }
			metaText={ __( 'Past 7 days' ) }
			isLink
		>
			<div className="site-overview-card__badge">
				<TrendComparison count={ currentData.visitors } previousCount={ previousData.visitors } />
			</div>
		</OverviewCard>
	);
}
