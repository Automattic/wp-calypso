import { SubscribersSortBy } from '@automattic/data-stores/src/reader';
import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { getSubscribersCacheKey } from '../helpers';
import type { Subscriber, SubscriberEndpointResponse } from '../types';

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
	const sortByDateSubscribed = ( a: Subscriber, b: Subscriber ) => {
		const aDate = new Date( a.date_subscribed );
		const bDate = new Date( b.date_subscribed );
		return aDate instanceof Date && bDate instanceof Date ? aDate.getTime() - bDate.getTime() : 0;
	};

	const sortByName = ( a: Subscriber, b: Subscriber ) =>
		a.display_name.localeCompare( b.display_name );

	const getSortFunction = ( sortTerm: SubscribersSortBy ) => {
		switch ( sortTerm ) {
			case SubscribersSortBy.DateSubscribed:
				return sortByDateSubscribed;
			case SubscribersSortBy.Name:
				return sortByName;
			default:
				return undefined;
		}
	};

	const sort = getSortFunction( sortTerm );

	return useQuery< SubscriberEndpointResponse >( {
		queryKey: getSubscribersCacheKey( siteId, page, perPage, search, sortTerm ),
		queryFn: () =>
			wpcom.req
				.get( {
					path: `/sites/${ siteId }/subscribers?per_page=${ perPage }&page=${ page }${
						search ? `&search=${ encodeURIComponent( search ) }` : ''
					}`,
					apiNamespace: 'wpcom/v2',
				} )
				.then( ( response: SubscriberEndpointResponse ) => {
					const subscribers = response.subscribers.sort( sort );
					return { ...response, subscribers };
				} ),
		enabled: !! siteId,
		keepPreviousData: true,
	} );
};

export default useSubscribersQuery;
