import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import wpcom from 'calypso/lib/wp';
import { SubscribersFilterBy, SubscribersSortBy } from '../constants';
import { getSubscribersCacheKey } from '../helpers';
import type { Subscriber, SubscriberEndpointResponse } from '../types';

type SubscriberQueryParams = {
	siteId: number | null;
	page?: number;
	perPage?: number;
	search?: string;
	sortTerm?: SubscribersSortBy;
	filterOption?: SubscribersFilterBy;
};

const useSubscribersQuery = ( {
	siteId,
	page = 1,
	perPage = 10,
	search,
	sortTerm = SubscribersSortBy.DateSubscribed,
	filterOption = SubscribersFilterBy.All,
}: SubscriberQueryParams ) => {
	const filterFunction = useCallback(
		( item: Subscriber ) => {
			switch ( filterOption ) {
				case SubscribersFilterBy.Email:
					return item.user_id === 0;
				case SubscribersFilterBy.WPCOM:
					return item.user_id !== 0;
				case SubscribersFilterBy.All:
				default:
					return true;
			}
		},
		[ filterOption ]
	);

	return useQuery< SubscriberEndpointResponse >( {
		queryKey: getSubscribersCacheKey( siteId, page, perPage, search, sortTerm, filterOption ),
		queryFn: () =>
			wpcom.req
				.get( {
					path: `/sites/${ siteId }/subscribers?per_page=${ perPage }&page=${ page }${
						search ? `&search=${ encodeURIComponent( search ) }` : ''
					}${ sortTerm ? `&sort=${ sortTerm }` : '' }`,
					apiNamespace: 'wpcom/v2',
				} )
				.then( ( response: SubscriberEndpointResponse ) => {
					const subscribers = response.subscribers.filter( filterFunction );
					return { ...response, subscribers };
				} ),
		enabled: !! siteId,
		keepPreviousData: true,
	} );
};

export default useSubscribersQuery;
