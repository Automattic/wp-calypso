import { queryOptions } from '@tanstack/react-query';
import { fetchCountryList } from '../../data/countries';
import type { CountryListItem } from '../../data/types';

const emptyList: CountryListItem[] = [];

export const countryListQuery = () =>
	queryOptions( {
		queryKey: [ 'checkout-country-list' ],
		queryFn: fetchCountryList,
		staleTime: 3600000, // 1 hour in milliseconds
		meta: {
			persist: false,
		},
		refetchOnWindowFocus: false,
		select: ( data ): CountryListItem[] => data ?? emptyList,
	} );
