import { useSuspenseQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { siteApmSlowQueriesQuery } from '../mock-data';
import SlowList, { type SlowListItem } from '../slow-list';
import type { ApmSlowQuery, Site } from '@automattic/api-core';

function toItems( queries: ApmSlowQuery[] ): SlowListItem[] {
	return queries.map( ( query ) => ( {
		id: query.id,
		label: query.query,
		avg_ms: query.avg_ms,
		max_ms: query.max_ms,
	} ) );
}

export default function Database( { site }: { site: Site } ) {
	const { data } = useSuspenseQuery( siteApmSlowQueriesQuery( site.ID ) );

	return (
		<SlowList
			title={ __( 'Slowest queries' ) }
			avgDescription={ __(
				'Average execution time per query across all calls in the selected period.'
			) }
			maxDescription={ __(
				'Slowest single execution observed for each query in the selected period.'
			) }
			items={ toItems( data ) }
		/>
	);
}
