/**
 * Internal Dependencies
 */
import ConnectedSubscriptionListItem from 'blocks/reader-subscription-list-item/connected';

export const siteRowRenderer = ( {
	items,
	rowRendererProps,
	extraRenderItemProps,
	measuredRowRenderer,
} ) => {
	const site = items[ rowRendererProps.index ];

	const feedUrl = site?.feed_URL;
	const feedId = +site?.feed_ID;
	const siteId = +site?.blog_ID;
	const railcar = site?.railcar;

	const props = {
		url: feedUrl,
		feedId,
		siteId,
		railcar,
		...extraRenderItemProps,
	};
	return measuredRowRenderer( ConnectedSubscriptionListItem, props, rowRendererProps );
};
