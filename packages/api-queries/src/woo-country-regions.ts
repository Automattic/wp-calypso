import { fetchWooCountryRegions } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const wooCountryRegionsQuery = () =>
	queryOptions( {
		queryKey: [ 'woo-country-regions' ] as const,
		queryFn: fetchWooCountryRegions,
		staleTime: Infinity,
	} );
