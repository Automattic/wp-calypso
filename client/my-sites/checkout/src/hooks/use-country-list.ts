import { transactionSupportedCountriesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import type { CountryListItem, CountryListItemWithVat } from '@automattic/wpcom-checkout';

const emptyList: CountryListItem[] = [];

export const isVatSupported = ( country: CountryListItem ): country is CountryListItemWithVat =>
	country.vat_supported;

export default function useCountryList( locale?: string ): CountryListItem[] {
	const result = useQuery( {
		...transactionSupportedCountriesQuery( locale ),
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
