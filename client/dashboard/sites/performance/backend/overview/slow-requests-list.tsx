import { __ } from '@wordpress/i18n';
import SlowList, { type SlowListItem } from '../slow-list';
import type { ApmSlowRequest } from '@automattic/api-core';

function toItems( requests: ApmSlowRequest[] ): SlowListItem[] {
	return requests.map( ( request ) => ( {
		id: request.id,
		label: `${ request.method } ${ request.url }`,
		avg_ms: request.avg_duration_ms,
		max_ms: request.duration_ms,
	} ) );
}

export default function SlowRequestsList( { slowRequests }: { slowRequests: ApmSlowRequest[] } ) {
	return (
		<SlowList
			title={ __( 'Slowest requests' ) }
			avgDescription={ __(
				'Average response time across the slowest endpoints in the selected period.'
			) }
			maxDescription={ __(
				'Slowest single response observed across these endpoints in the selected period.'
			) }
			items={ toItems( slowRequests ) }
		/>
	);
}
