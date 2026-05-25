import { __ } from '@wordpress/i18n';
import SlowList, { type SlowListItem } from '../slow-list';
import { buildRequestDetailHref } from '../utils';
import type { MergedRoute } from '../aggregate';

function toItems( routes: MergedRoute[], siteSlug: string ): SlowListItem[] {
	return routes.map( ( route ) => ( {
		id: route.id,
		label: `${ route.method } ${ route.route }`,
		avg_ms: route.duration_ms.avg,
		max_ms: route.duration_ms.max,
		href: buildRequestDetailHref( siteSlug, route.method, route.route ),
	} ) );
}

export default function SlowRequestsList( {
	routes,
	siteSlug,
}: {
	routes: MergedRoute[];
	siteSlug: string;
} ) {
	return (
		<SlowList
			title={ __( 'Slowest requests' ) }
			avgDescription={ __(
				'Average response time across the slowest endpoints in the selected period.'
			) }
			maxDescription={ __(
				'Slowest single response observed across these endpoints in the selected period.'
			) }
			items={ toItems( routes, siteSlug ) }
		/>
	);
}
