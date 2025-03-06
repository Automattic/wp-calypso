import { useQuery, UseQueryResult } from '@tanstack/react-query';
import request from 'wpcom-proxy-request';
import type { Category } from './types';

export const getCategoriesKey = ( siteId?: string | number ) => [ 'categories', siteId ];

const useCategoriesQuery = ( siteId?: string | number ): UseQueryResult< Category[] > => {
	return useQuery( {
		queryKey: getCategoriesKey( siteId ),
		queryFn: () =>
			request< Category[] >( {
				path: `/sites/${ siteId }/categories`,
				apiNamespace: 'wp/v2',
			} ),
		initialData: [],
		enabled: !! siteId,
	} );
};

export default useCategoriesQuery;
