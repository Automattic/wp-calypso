import { fetchProducts } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const productsQuery = ( type?: string ) =>
	queryOptions( {
		queryKey: [ 'products', type ],
		queryFn: () => fetchProducts( type ),
		staleTime: 5 * 60 * 1000,
	} );
