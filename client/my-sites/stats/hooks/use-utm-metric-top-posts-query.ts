import { useEffect } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { requestTopPosts } from 'calypso/state/stats/utm-metrics/actions';
import { getTopPosts } from 'calypso/state/stats/utm-metrics/selectors';
import { UTMMetricItem } from 'calypso/state/stats/utm-metrics/types';

export default function useUTMMetricTopPostsQuery(
	siteId: number,
	UTMParam: string,
	metrics: Array< UTMMetricItem >
) {
	const dispatch = useDispatch();

	const metricsKey = JSON.stringify( metrics );
	useEffect( () => {
		if ( JSON.parse( metricsKey ).length > 0 ) {
			JSON.parse( metricsKey ).forEach( ( metric: UTMMetricItem ) => {
				if ( metric.paramValues ) {
					dispatch( requestTopPosts( siteId, UTMParam, metric.paramValues ) );
				}
			} );
		}
	}, [ dispatch, siteId, UTMParam, metricsKey ] );

	const topPosts = useSelector( ( state ) => getTopPosts( state, siteId ) );

	return {
		topPosts,
	};
}
