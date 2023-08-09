import { useQuery, UseQueryResult } from '@tanstack/react-query';
import request from 'wpcom-proxy-request';
import type { Category } from './types';

const useCategoriesQuery = ( blogId?: number ): UseQueryResult< Category[] > => {
	return useQuery( {
		queryKey: [ 'categories', blogId ],
		queryFn: () =>
			request< Category[] >( {
				path: `/sites/${ blogId }/categories`,
				apiVersion: '2',
				apiNamespace: 'wp/v2',
			} ),
		initialData: [],
		enabled: !! blogId,
	} );
};

export default useCategoriesQuery;
