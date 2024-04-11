import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import type { CountryListItem, CountryListItemWithVat } from '@automattic/wpcom-checkout';

const emptyList: CountryListItem[] = [];

export const isVatSupported = ( country: CountryListItem ): country is CountryListItemWithVat =>
	country.vat_supported;

const countryListQueryKey = [ 'checkout-country-list' ];

async function fetchCountryListForCheckout(): Promise< CountryListItem[] > {
	return await wpcom.req.get( {
		path: '/me/transactions/supported-countries',
		apiVersion: '1.1',
	} );
}

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

export function useTaxName( countryCode: string ): undefined | string {
	const countryList = useCountryList();
	const country = countryList.find( ( country ) => country.code === countryCode );
	return country?.tax_name;
}
