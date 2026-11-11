import { fetchWooCountryRegions } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const wooCountryRegionsQuery = () =>
	queryOptions( {
		queryKey: [ 'woo-country-regions' ] as const,
		queryFn: fetchWooCountryRegions,
		staleTime: Infinity,
		// The labels are localized. Locale switches force a full reload, so the
		// in-memory cache is safe, but a persisted copy would outlive the switch.
		meta: { persist: false },
	} );
