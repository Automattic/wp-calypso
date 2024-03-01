import { useEffect } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { requestMetrics } from 'calypso/state/stats/utm-metrics/actions';
import { getMetrics, isLoading } from 'calypso/state/stats/utm-metrics/selectors';

export default function useUTMMetricsQuery( siteId: number, UTMParam: string, postId?: number ) {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( requestMetrics( siteId, UTMParam, postId ) );
	}, [ dispatch, siteId, UTMParam, postId ] );

	const isFetching = useSelector( ( state ) => isLoading( state, siteId ) );
	const metrics = useSelector( ( state ) => getMetrics( state, siteId, postId ) );

	return {
		isFetching,
		metrics,
	};
}
