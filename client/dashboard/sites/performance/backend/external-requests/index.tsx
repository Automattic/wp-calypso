import { useSuspenseQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { siteApmExternalRequestsQuery } from '../mock-data';
import SlowList, { type SlowListItem } from '../slow-list';
import type { ApmExternalRequest, Site } from '@automattic/api-core';

function toItems( requests: ApmExternalRequest[] ): SlowListItem[] {
	return requests.map( ( request ) => ( {
		id: `${ request.method } ${ request.host }${ request.endpoint }`,
		label: `${ request.method } ${ request.host }${ request.endpoint }`,
		avg_ms: request.avg_ms,
		max_ms: request.max_ms,
	} ) );
}

export default function ExternalRequests( { site }: { site: Site } ) {
	const { data } = useSuspenseQuery( siteApmExternalRequestsQuery( site.ID ) );

	return (
		<SlowList
			title={ __( 'Slowest external requests' ) }
			avgDescription={ __(
				'Average response time for outbound calls to each third-party host in the selected period.'
			) }
			maxDescription={ __(
				'Slowest single outbound call observed to each third-party host in the selected period.'
			) }
			items={ toItems( data ) }
		/>
	);
}
