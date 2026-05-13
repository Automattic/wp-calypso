import { useSuspenseQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { siteApmTransactionsQuery } from '../mock-data';
import SlowList, { type SlowListItem } from '../slow-list';
import type { ApmTransaction, Site } from '@automattic/api-core';

function toItems( transactions: ApmTransaction[] ): SlowListItem[] {
	return transactions.map( ( transaction ) => ( {
		id: `${ transaction.method } ${ transaction.url }`,
		label: `${ transaction.method } ${ transaction.url }`,
		avg_ms: transaction.avg_ms,
		max_ms: transaction.max_ms,
	} ) );
}

export default function Transactions( { site }: { site: Site } ) {
	const { data } = useSuspenseQuery( siteApmTransactionsQuery( site.ID ) );

	return (
		<SlowList
			title={ __( 'Slowest transactions' ) }
			avgDescription={ __(
				'Average response time per route across all transactions in the selected period.'
			) }
			maxDescription={ __(
				'Slowest single transaction observed on each route in the selected period.'
			) }
			items={ toItems( data ) }
		/>
	);
}
