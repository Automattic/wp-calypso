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
		queryFn: () => {
			// When user_type is set to 'all', we use the 'subscribers' endpoint, which has aggregation.
			// This is a temporary solution until we have a better way to handle this.
			const pathRoute =
				filterOption === SubscribersFilterBy.All ? 'subscribers' : 'subscribers_by_user_type';
			const userTypeField = filterOption === SubscribersFilterBy.All ? 'filter' : 'user_type';

			return wpcom.req.get( {
				path: `/sites/${ siteId }/${ pathRoute }?per_page=${ perPage }&page=${ page }${
					search ? `&search=${ encodeURIComponent( search ) }` : ''
				}${ sortTerm ? `&sort=${ sortTerm }` : '' }${
					filterOption ? `&${ userTypeField }=${ filterOption }` : ''
				}`,
				apiNamespace: 'wpcom/v2',
			} );
		},
		enabled: !! siteId,
		keepPreviousData: true,
	} );
};

export default useSubscribersQuery;
