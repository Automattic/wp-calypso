import { useEffect } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { requestTopPosts } from 'calypso/state/stats/utm-metrics/actions';
import { getTopPosts } from 'calypso/state/stats/utm-metrics/selectors';
import { UTMMetricItem } from 'calypso/state/stats/utm-metrics/types';

export default function useUTMMetricTopPostsQuery(
	siteId: number,
	UTMParam: string,
	metrics: Array< UTMMetricItem >
) {
	const dispatch = useDispatch();
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) ) as string;

	// TODO: Remove this hook.
	// Logic here no longer works as the metrics object
	// contains all the necessary children.
	const metricsKey = JSON.stringify( metrics );
	useEffect( () => {
		if ( JSON.parse( metricsKey ).length > 0 ) {
			JSON.parse( metricsKey ).forEach( ( metric: UTMMetricItem ) => {
				if ( metric.paramValues ) {
					dispatch( requestTopPosts( siteId, UTMParam, metric.paramValues, siteSlug ) );
				}
			} );
		}
		// No passed `UTMParam` to prevent triggering a new request before fetching the new metrics.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ dispatch, siteId, metricsKey ] );

	const topPosts = useSelector( ( state ) => getTopPosts( state, siteId ) );

	return {
		topPosts,
	};
}
