import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { DEFAULT_PER_PAGE, SubscribersFilterBy, SubscribersSortBy } from '../constants';
import { getSubscribersCacheKey } from '../helpers';
import type { SubscriberEndpointResponse } from '../types';

type SubscriberQueryParams = {
	siteId: number | undefined | null;
	page?: number;
	perPage?: number;
	search?: string;
	sortTerm?: SubscribersSortBy;
	filterOption?: SubscribersFilterBy;
};

const useSubscribersQuery = ( {
	siteId,
	page = 1,
	perPage = DEFAULT_PER_PAGE,
	search,
	sortTerm = SubscribersSortBy.DateSubscribed,
	filterOption = SubscribersFilterBy.All,
}: SubscriberQueryParams ) => {
	return useQuery< SubscriberEndpointResponse >( {
		queryKey: getSubscribersCacheKey( siteId, page, perPage, search, sortTerm, filterOption ),
		queryFn: () =>
			wpcom.req.get( {
				path: `/sites/${ siteId }/subscribers?per_page=${ perPage }&page=${ page }${
					search ? `&search=${ encodeURIComponent( search ) }` : ''
				}${ sortTerm ? `&sort=${ sortTerm }` : '' }${
					filterOption ? `&filter=${ filterOption }` : ''
				}`,
				apiNamespace: 'wpcom/v2',
			} ),
		enabled: !! siteId,
		keepPreviousData: true,
	} );
};

export default useSubscribersQuery;
