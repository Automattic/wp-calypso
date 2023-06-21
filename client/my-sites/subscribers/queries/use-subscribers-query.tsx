import { SubscribersFilterBy } from '@automattic/data-stores/src/reader';
import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import wpcom from 'calypso/lib/wp';
import { getSubscribersCacheKey } from '../helpers';
import type { Subscriber, SubscriberEndpointResponse } from '../types';

type SubscriberQueryParams = {
	siteId: number | null;
	page?: number;
	perPage?: number;
	search?: string;
	filterOption?: SubscribersFilterBy;
};

const useSubscribersQuery = ( {
	siteId,
	page = 1,
	perPage = 10,
	search,
	filterOption = SubscribersFilterBy.All,
}: SubscriberQueryParams ) => {
	const filterFunction = useCallback(
		( item: Subscriber ) => {
			switch ( filterOption ) {
				case SubscribersFilterBy.Paid:
					return item.plans && item.plans.length > 0;
				case SubscribersFilterBy.Free:
					return typeof item.plans === 'undefined';
				case SubscribersFilterBy.All:
				default:
					return true;
			}
		},
		[ filterOption ]
	);
	return useQuery< SubscriberEndpointResponse >( {
		queryKey: getSubscribersCacheKey( siteId, page, perPage, search, filterOption ),
		queryFn: () =>
			wpcom.req
				.get( {
					path: `/sites/${ siteId }/subscribers?per_page=${ perPage }&page=${ page }${
						search ? `&search=${ encodeURIComponent( search ) }` : ''
					}`,
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
