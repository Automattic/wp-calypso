/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Internal Dependencies
 */
import ConnectedSubscriptionListItem from 'calypso/blocks/reader-subscription-list-item/connected';

export const siteRowRenderer = ( {
	items,
	rowRendererProps,
	extraRenderItemProps,
	measuredRowRenderer,
} ) => {
	const site = items[ rowRendererProps.index ];

	const feedUrl = get( site, 'feed_URL' );
	const feedId = +get( site, 'feed_ID' );
	const siteId = +get( site, 'blog_ID' );
	const railcar = get( site, 'railcar' );

	const props = {
		url: feedUrl,
		feedId,
		siteId,
		railcar,
		...extraRenderItemProps,
	};
	return measuredRowRenderer( ConnectedSubscriptionListItem, props, rowRendererProps );
};
