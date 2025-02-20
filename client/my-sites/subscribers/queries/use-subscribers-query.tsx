import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { DEFAULT_PER_PAGE, SubscribersFilterBy, SubscribersSortBy } from '../constants';
import { getSubscribersCacheKey } from '../helpers';
import type { SubscriberEndpointResponse } from '../types';

type SubscriberQueryParams = {
	siteId: number | null;
	page?: number;
	perPage?: number;
	search?: string;
	sortTerm?: SubscribersSortBy;
	sortOrder?: 'asc' | 'desc';
	filterOption?: SubscribersFilterBy;
	filters?: SubscribersFilterBy[];
	timestamp?: number;
	limitData?: boolean;
};

const useSubscribersQuery = ( {
	siteId,
	page = 1,
	perPage = DEFAULT_PER_PAGE,
	search,
	sortTerm = SubscribersSortBy.DateSubscribed,
	sortOrder,
	filters = [],
}: SubscriberQueryParams ) => {
	const query = useQuery< SubscriberEndpointResponse >( {
		queryKey: getSubscribersCacheKey( {
			siteId,
			page,
			perPage,
			search,
			sortTerm,
			filters,
			sortOrder,
		} ),
		queryFn: () => {
			const params = new URLSearchParams( {
				per_page: perPage.toString(),
				page: page.toString(),
				...( search && { search } ),
				...( sortTerm && { sort: sortTerm } ),
				...( sortOrder && { sort_order: sortOrder } ),
			} );

			filters.forEach( ( filter ) => {
				params.append( 'filters[]', filter );
			} );

			return wpcom.req.get( {
				path: `/sites/${ siteId }/subscribers?${ params.toString() }`,
				apiNamespace: 'wpcom/v2',
			} );
		},
		enabled: !! siteId,
	} );

	return { ...query, isLoading: query.isLoading };
};

export default useSubscribersQuery;
