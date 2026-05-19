import { siteApmAggregateQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import { mergeAggregates, type MergedDbQuery } from '../aggregate';
import SlowList, { type SlowListItem } from '../slow-list';
import type { Site } from '@automattic/api-core';

function toItems( queries: MergedDbQuery[] ): SlowListItem[] {
	return queries.map( ( query ) => ( {
		id: query.id,
		label: query.fingerprint,
		avg_ms: query.avg_ms,
		max_ms: query.max_ms,
	} ) );
}

export default function Database( { site }: { site: Site } ) {
	const { data } = useSuspenseQuery( siteApmAggregateQuery( site.ID ) );
	const merged = useMemo( () => mergeAggregates( data.aggregates ), [ data.aggregates ] );

	return (
		<SlowList
			title={ __( 'Slowest queries' ) }
			avgDescription={ __(
				'Average execution time per query across all calls in the selected period.'
			) }
			maxDescription={ __(
				'Slowest single execution observed for each query in the selected period.'
			) }
			items={ toItems( merged.slowest.db_queries ) }
		/>
	);
}
