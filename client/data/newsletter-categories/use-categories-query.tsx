import { useQuery, UseQueryResult } from '@tanstack/react-query';
import request from 'wpcom-proxy-request';
import type { Category } from './types';

const useCategoriesQuery = ( siteId?: string | number ): UseQueryResult< Category[] > => {
	return useQuery( {
		queryKey: [ 'categories', siteId ],
		queryFn: () =>
			request< Category[] >( {
				path: `/sites/${ siteId }/categories`,
				apiVersion: '2',
				apiNamespace: 'wp/v2',
			} ),
		initialData: [],
		enabled: !! siteId,
	} );
};

export default useCategoriesQuery;
