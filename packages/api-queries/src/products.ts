import { fetchProducts } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const productsQuery = () =>
	queryOptions( {
		queryKey: [ 'products' ],
		queryFn: () => fetchProducts(),
	} );
