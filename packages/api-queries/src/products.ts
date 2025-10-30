import { fetchProducts, fetchProductsFeatures } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const productsQuery = () =>
	queryOptions( {
		queryKey: [ 'products' ],
		queryFn: () => fetchProducts(),
	} );

export const productsFeaturesQuery = () =>
	queryOptions( {
		queryKey: [ 'products', 'features' ],
		queryFn: () => fetchProductsFeatures(),
	} );
