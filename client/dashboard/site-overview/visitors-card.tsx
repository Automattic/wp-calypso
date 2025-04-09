import { useLoaderData } from '@tanstack/react-router';
import { __, sprintf } from '@wordpress/i18n';
import { people } from '@wordpress/icons';
import OverviewCard from './overview-card';
import type { FetchSiteRouteResponse } from '../data/types';

export default function VisitorsCard() {
	const { engagementStats } = useLoaderData( {
		from: '/sites/$siteId',
	} ) as FetchSiteRouteResponse;

	// Default to 0 if no visitor data is available
	const visitorCount = engagementStats?.[ '7d' ] || 0;

	return (
		<OverviewCard
			title={ __( 'Visitors' ) }
			icon={ people }
			heading={ String( visitorCount ) }
			metaText={ __( 'Past 7 days' ) }
		/>
	);
}
