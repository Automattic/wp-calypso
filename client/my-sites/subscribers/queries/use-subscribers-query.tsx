import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { DEFAULT_PER_PAGE, SubscribersFilterBy, SubscribersSortBy } from '../constants';
import { getSubscribersCacheKey } from '../helpers';
import useManySubsSite from '../hooks/use-many-subs-site';
import type { SubscriberEndpointResponse } from '../types';

type SubscriberQueryParams = {
	siteId: number | null;
	page?: number;
	perPage?: number;
	search?: string;
	sortTerm?: SubscribersSortBy;
	sortOrder?: 'asc' | 'desc';
	filterOption?: SubscribersFilterBy;
	timestamp: number;
};

const useSubscribersQuery = ( {
	siteId,
	page = 1,
	perPage = DEFAULT_PER_PAGE,
	search,
	timestamp,
	sortTerm = SubscribersSortBy.DateSubscribed,
	sortOrder,
	filterOption = SubscribersFilterBy.All,
}: SubscriberQueryParams ) => {
	const { hasManySubscribers, isLoading } = useManySubsSite( siteId );
	const shouldFetch = ! isLoading;

	const query = useQuery< SubscriberEndpointResponse >( {
		queryKey: getSubscribersCacheKey(
			siteId,
			page,
			perPage,
			search,
			sortTerm,
			filterOption,
			hasManySubscribers,
			timestamp,
			sortOrder
		),
		queryFn: () => {
			// This is a temporary solution until we have a better way to handle this.
			const pathRoute = hasManySubscribers ? 'subscribers_by_user_type' : 'subscribers';
			const userTypeField = hasManySubscribers ? 'user_type' : 'filter';

			const validatedFilterOption =
				hasManySubscribers && filterOption === SubscribersFilterBy.All
					? SubscribersFilterBy.WPCOM
					: filterOption;

			const params = new URLSearchParams( {
				per_page: perPage.toString(),
				page: page.toString(),
				[ userTypeField ]: validatedFilterOption,
				...( search && { search } ),
				...( sortTerm && { sort: sortTerm } ),
				...( sortOrder && { sort_order: sortOrder } ),
			} );

			return wpcom.req.get( {
				path: `/sites/${ siteId }/${ pathRoute }?${ params.toString() }`,
				apiNamespace: 'wpcom/v2',
			} );
		},
		enabled: !! siteId && shouldFetch,
	} );

	return { ...query, isLoading: query.isLoading || isLoading };
};

export default useSubscribersQuery;
