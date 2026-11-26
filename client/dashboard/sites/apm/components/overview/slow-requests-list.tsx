import { __ } from '@wordpress/i18n';
import { routesToSlowListItems } from '../../utils/format';
import SlowList from '../slow-list';
import type { MergedRoute } from '../../utils/aggregate';

export default function SlowRequestsList( {
	routes,
	siteSlug,
}: {
	routes: MergedRoute[];
	siteSlug: string;
} ) {
	return (
		<SlowList
			title={ __( 'Slowest requests' ) }
			avgDescription={ __(
				'Average response time across the slowest endpoints in the selected period.'
			) }
			maxDescription={ __(
				'Slowest single response observed across these endpoints in the selected period.'
			) }
			items={ routesToSlowListItems( routes, siteSlug ) }
		/>
	);
}
