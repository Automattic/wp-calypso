import { __ } from '@wordpress/i18n';
import SlowList, { type SlowListItem } from '../slow-list';
import type { MergedAggregate, MergedExternal } from '../aggregate';

function toItems( externals: MergedExternal[] ): SlowListItem[] {
	return externals.map( ( external ) => ( {
		id: external.id,
		label: `${ external.method } ${ external.host }`,
		avg_ms: external.avg_ms,
		max_ms: external.max_ms,
	} ) );
}

export default function ExternalRequests( { merged }: { merged: MergedAggregate } ) {
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
