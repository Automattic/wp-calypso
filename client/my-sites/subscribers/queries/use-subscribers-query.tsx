import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { getSubscribersCacheKey } from '../helpers';
import type { SubscriberEndpointResponse } from '../types';

type SubscriberQueryParams = {
	siteId: number | null;
	page?: number;
	perPage?: number;
	search?: string;
};

const useSubscribersQuery = ( {
	siteId,
	page = 1,
	perPage = 10,
	search,
}: SubscriberQueryParams ) => {
	return useQuery< SubscriberEndpointResponse >( {
		queryKey: getSubscribersCacheKey( siteId, page, perPage, search ),
		queryFn: () =>
			wpcom.req.get( {
				path: `/sites/${ siteId }/subscribers?per_page=${ perPage }&page=${ page }${
					search ? `&search=${ encodeURIComponent( search ) }` : ''
				}`,
				apiNamespace: 'wpcom/v2',
			} ),
		enabled: !! siteId,
		keepPreviousData: true,
	} );
};

export default useSubscribersQuery;
