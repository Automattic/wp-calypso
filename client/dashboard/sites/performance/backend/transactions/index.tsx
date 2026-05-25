import { __ } from '@wordpress/i18n';
import SlowList, { type SlowListItem } from '../slow-list';
import { buildRequestDetailHref } from '../utils';
import type { MergedAggregate, MergedRoute } from '../aggregate';

function toItems( routes: MergedRoute[], siteSlug: string ): SlowListItem[] {
	return routes.map( ( route ) => ( {
		id: route.id,
		label: `${ route.method } ${ route.route }`,
		avg_ms: route.duration_ms.avg,
		max_ms: route.duration_ms.max,
		href: buildRequestDetailHref( siteSlug, route.method, route.route ),
	} ) );
}

export default function Transactions( {
	merged,
	siteSlug,
}: {
	merged: MergedAggregate;
	siteSlug: string;
} ) {
	return (
		<SlowList
			title={ __( 'Slowest transactions' ) }
			avgDescription={ __(
				'Average response time per route across all transactions in the selected period.'
			) }
			maxDescription={ __(
				'Slowest single transaction observed on each route in the selected period.'
			) }
			items={ toItems( merged.slowest.routes, siteSlug ) }
		/>
	);
}
