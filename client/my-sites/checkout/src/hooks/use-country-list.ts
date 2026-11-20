import { transactionSupportedCountriesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { earlyRequestKeys, withEarlyQueryRequest } from '../lib/early-requests';
import type { CountryListItem, CountryListItemWithVat } from '@automattic/wpcom-checkout';

const emptyList: CountryListItem[] = [];

export const isVatSupported = ( country: CountryListItem ): country is CountryListItemWithVat =>
	country.vat_supported;

export default function useCountryList( locale?: string ): CountryListItem[] {
	const query = transactionSupportedCountriesQuery( locale );
	const result = useQuery( {
		...query,
		queryFn: withEarlyQueryRequest( earlyRequestKeys.countries( locale ), query.queryFn ),
		meta: {
			persist: false,
		},
		refetchOnWindowFocus: false,
		// The list does not change while checkout is open. Without a stale time,
		// each component that mounts later and reads it fetches it again.
		staleTime: Infinity,
	} );
	return result.data ?? emptyList;
}

export function useTaxName( countryCode: string, locale?: string ): undefined | string {
	const countryList = useCountryList( locale );
	const country = countryList.find( ( country ) => country.code === countryCode );
	return country?.tax_name;
}
