import { useQuery, UseQueryResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import type { APIAgencyResourcesResponse } from './types';

export const getAgencyResourcesQueryKey = () => {
	return [ 'a4a-agency-resources' ];
};

function queryAgencyResources(): Promise< APIAgencyResourcesResponse > {
	return wpcom.req.get( {
		apiNamespace: 'wpcom/v2',
		path: '/agency/resources',
	} );
}

export default function useFetchAgencyResources(): UseQueryResult<
	APIAgencyResourcesResponse,
	unknown
> {
	return useQuery( {
		queryKey: getAgencyResourcesQueryKey(),
		queryFn: queryAgencyResources,
		refetchOnWindowFocus: false,
	} );
}
