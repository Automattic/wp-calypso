import { __ } from '@wordpress/i18n';
import SlowList from '../slow-list';
import { routesToSlowListItems } from '../utils';
import type { MergedAggregate } from '../aggregate';

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
			items={ routesToSlowListItems( merged.slowest.routes, siteSlug ) }
		/>
	);
}
