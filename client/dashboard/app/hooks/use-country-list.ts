import { useQuery } from '@tanstack/react-query';
import { fetchCountryListForCheckout } from '../../data/countries';
import type { CountryListItem } from '../../data/types';

const emptyList: CountryListItem[] = [];

const countryListQueryKey = [ 'checkout-country-list' ];

export default function useCountryList(): CountryListItem[] {
	const result = useQuery( {
		queryKey: countryListQueryKey,
		queryFn: fetchCountryListForCheckout,
		meta: {
			persist: false,
		},
		refetchOnWindowFocus: false,
	} );
	return result.data ?? emptyList;
}
