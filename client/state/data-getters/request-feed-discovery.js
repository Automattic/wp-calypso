/**
 * Internal dependencies
 */
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { requestHttpData } from 'calypso/state/data-layer/http-data';
import { noRetry } from 'calypso/state/data-layer/wpcom-http/pipeline/retry-on-failure/policies';

const requestFeedDiscovery = ( feedId ) => {
	const requestId = `feed-discovery-${ feedId }`;

	return requestHttpData(
		requestId,
		http(
			{
				method: 'GET',
				path: '/read/feed',
				query: {
					url: feedId,
				},
				retryPolicy: noRetry(),
			},
			{}
		),
		{
			fromApi: () => ( response ) => [ [ requestId, response.feeds[ 0 ].feed_ID ] ],
		}
	);
};

export default requestFeedDiscovery;
