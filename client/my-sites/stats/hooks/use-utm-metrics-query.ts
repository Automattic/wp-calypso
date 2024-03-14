import { useEffect } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { requestMetrics } from 'calypso/state/stats/utm-metrics/actions';
import { getMetrics, isLoading } from 'calypso/state/stats/utm-metrics/selectors';

export default function useUTMMetricsQuery(
	siteId: number,
	UTMParam: string,
	query: object,
	postId?: number
) {
	const dispatch = useDispatch();
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) ) as string;

	useEffect( () => {
		dispatch( requestMetrics( siteId, UTMParam, query, postId, siteSlug ) );
	}, [ dispatch, siteId, UTMParam, query, postId, siteSlug ] );

	const isFetching = useSelector( ( state ) => isLoading( state, siteId ) );
	const metrics = useSelector( ( state ) => getMetrics( state, siteId, postId ) );

	return {
		isFetching,
		metrics,
	};
}
