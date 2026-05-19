import { siteApmAggregateQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import { mergeAggregates, type MergedRoute } from '../aggregate';
import SlowList, { type SlowListItem } from '../slow-list';
import type { Site } from '@automattic/api-core';

function toItems( routes: MergedRoute[] ): SlowListItem[] {
	return routes.map( ( route ) => ( {
		id: route.id,
		label: `${ route.method } ${ route.route }`,
		avg_ms: route.duration_ms.avg,
		max_ms: route.duration_ms.max,
	} ) );
}

export default function Transactions( { site }: { site: Site } ) {
	const { data } = useSuspenseQuery( siteApmAggregateQuery( site.ID ) );
	const merged = useMemo( () => mergeAggregates( data.aggregates ), [ data.aggregates ] );

	return (
		<SlowList
			title={ __( 'Slowest transactions' ) }
			avgDescription={ __(
				'Average response time per route across all transactions in the selected period.'
			) }
			maxDescription={ __(
				'Slowest single transaction observed on each route in the selected period.'
			) }
			items={ toItems( merged.slowest.routes ) }
		/>
	);
}
