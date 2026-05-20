import { __ } from '@wordpress/i18n';
import SlowList, { type SlowListItem } from '../slow-list';
import type { MergedAggregate, MergedRoute } from '../aggregate';

function toItems( routes: MergedRoute[] ): SlowListItem[] {
	return routes.map( ( route ) => ( {
		id: route.id,
		label: `${ route.method } ${ route.route }`,
		avg_ms: route.duration_ms.avg,
		max_ms: route.duration_ms.max,
	} ) );
}

export default function Transactions( { merged }: { merged: MergedAggregate } ) {
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
