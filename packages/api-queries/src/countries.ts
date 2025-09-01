import { fetchCountryList } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';
import type { CountryListItem } from '@automattic/api-core';

const emptyList: CountryListItem[] = [];

export const countryListQuery = () =>
	queryOptions( {
		queryKey: [ 'supported-countries' ],
		queryFn: fetchCountryList,
		staleTime: 3600000, // 1 hour in milliseconds
		meta: {
			persist: false,
		},
		refetchOnWindowFocus: false,
		select: ( data ): CountryListItem[] => data ?? emptyList,
	} );
