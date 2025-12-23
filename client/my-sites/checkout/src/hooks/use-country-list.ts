import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import type { CountryListItem, CountryListItemWithVat } from '@automattic/wpcom-checkout';

const emptyList: CountryListItem[] = [];

export const isVatSupported = ( country: CountryListItem ): country is CountryListItemWithVat =>
	country.vat_supported;

const getCountryListQueryKey = ( locale?: string ) => [ 'checkout-country-list', locale ?? '' ];

async function fetchCountryListForCheckout( locale?: string ): Promise< CountryListItem[] > {
	const query = locale ? { locale } : undefined;

	return await wpcom.req.get(
		{
			path: '/me/transactions/supported-countries',
			apiVersion: '1.1',
		},
		query
	);
}

export default function useCountryList( locale?: string ): CountryListItem[] {
	const result = useQuery( {
		queryKey: getCountryListQueryKey( locale ),
		queryFn: () => fetchCountryListForCheckout( locale ),
		meta: {
			persist: false,
		},
		refetchOnWindowFocus: false,
	} );
	return result.data ?? emptyList;
}

export function useTaxName( countryCode: string, locale?: string ): undefined | string {
	const countryList = useCountryList( locale );
	const country = countryList.find( ( country ) => country.code === countryCode );
	return country?.tax_name;
}
