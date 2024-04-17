import { useEffect } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { requestMetrics } from 'calypso/state/stats/utm-metrics/actions';
import { getMetrics, isLoading } from 'calypso/state/stats/utm-metrics/selectors';

// TODO: replace UTM endopint with Devices when ready
const useModuleDevicesQuery = (
	siteId: number,
	devicesParam: string,
	query: object,
	postId?: number
) => {
	const dispatch = useDispatch();
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) ) as string;

	// The query object is used as a dependency for the effect,
	// so it needs to be stringified.
	const queryKey = JSON.stringify( query );
	useEffect( () => {
		dispatch( requestMetrics( siteId, devicesParam, query, postId, siteSlug ) );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ dispatch, siteId, devicesParam, queryKey, postId, siteSlug ] );

	const isFetching = useSelector( ( state ) => isLoading( state, siteId ) );
	const metrics = useSelector( ( state ) => getMetrics( state, siteId, postId ) );

	return {
		isFetching,
		metrics,
	};
};

export default useModuleDevicesQuery;
