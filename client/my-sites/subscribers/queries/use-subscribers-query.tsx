import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { getSubscribersCacheKey } from '../helpers';
import type { SubscriberEndpointResponse } from '../types';

const useSubscribersQuery = ( siteId: number | null, page = 1, perPage = 10 ) => {
	return useQuery< SubscriberEndpointResponse >( {
		queryKey: getSubscribersCacheKey( siteId, page, perPage ),
		queryFn: () =>
			wpcom.req.get( {
				path: `/sites/${ siteId }/subscribers?per_page=${ perPage }&page=${ page }`,
				apiNamespace: 'wpcom/v2',
			} ),
		enabled: !! siteId,
		keepPreviousData: true,
	} );
};

export default useSubscribersQuery;
