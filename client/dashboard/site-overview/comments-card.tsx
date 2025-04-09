import { TrendComparison } from '@automattic/components/src/highlight-cards/count-comparison-card';
import { useLoaderData } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { comment } from '@wordpress/icons';
import OverviewCard from './overview-card';
import type { FetchSiteRouteResponse } from '../data/types';

export default function CommentsCard() {
	const {
		engagementStats: { currentData, previousData },
	} = useLoaderData( {
		from: '/sites/$siteId',
	} ) as FetchSiteRouteResponse;
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
