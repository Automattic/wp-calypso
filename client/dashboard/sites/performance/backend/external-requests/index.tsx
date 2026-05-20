import { siteApmAggregateQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import { mergeAggregates, type MergedExternal } from '../aggregate';
import SlowList, { type SlowListItem } from '../slow-list';
import type { Site } from '@automattic/api-core';

function toItems( externals: MergedExternal[] ): SlowListItem[] {
	return externals.map( ( external ) => ( {
		id: external.id,
		label: `${ external.method } ${ external.host }`,
		avg_ms: external.avg_ms,
		max_ms: external.max_ms,
	} ) );
}

export default function ExternalRequests( { site }: { site: Site } ) {
	const { data } = useSuspenseQuery( siteApmAggregateQuery( site.ID ) );
	const merged = useMemo( () => mergeAggregates( data.aggregates ), [ data.aggregates ] );

	return (
		<SlowList
			title={ __( 'Slowest external requests' ) }
			avgDescription={ __(
				'Average response time for outbound calls to each third-party host in the selected period.'
			) }
			maxDescription={ __(
				'Slowest single outbound call observed to each third-party host in the selected period.'
			) }
			items={ toItems( merged.slowest.externals ) }
		/>
	);
}
