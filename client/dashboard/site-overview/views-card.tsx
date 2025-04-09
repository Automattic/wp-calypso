import { TrendComparison } from '@automattic/components/src/highlight-cards/count-comparison-card';
import { useLoaderData } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { seen } from '@wordpress/icons';
import OverviewCard from './overview-card';
import type { FetchSiteRouteResponse } from '../data/types';

export default function ViewsCard() {
	const {
		engagementStats: { currentData, previousData },
	} = useLoaderData( {
		from: '/sites/$siteId',
	} ) as FetchSiteRouteResponse;
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
