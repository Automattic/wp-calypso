import { SubscribersSortBy } from '@automattic/data-stores/src/reader';
import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { getSubscribersCacheKey } from '../helpers';
import type { SubscriberEndpointResponse } from '../types';

type SubscriberQueryParams = {
	siteId: number | null;
	page?: number;
	perPage?: number;
	search?: string;
	sortTerm?: SubscribersSortBy;
};

const useSubscribersQuery = ( {
	siteId,
	page = 1,
	perPage = 10,
	search,
	sortTerm = SubscribersSortBy.DateSubscribed,
}: SubscriberQueryParams ) => {
	return useQuery< SubscriberEndpointResponse >( {
		queryKey: getSubscribersCacheKey( siteId, page, perPage, search, sortTerm ),
		queryFn: () =>
			wpcom.req.get( {
				path: `/sites/${ siteId }/subscribers?per_page=${ perPage }&page=${ page }${
					search ? `&search=${ encodeURIComponent( search ) }` : ''
				}${ sortTerm ? `&sort=${ sortTerm }` : '' }`,
				apiNamespace: 'wpcom/v2',
			} ),
		enabled: !! siteId,
		keepPreviousData: true,
	} );
};

export default useSubscribersQuery;
