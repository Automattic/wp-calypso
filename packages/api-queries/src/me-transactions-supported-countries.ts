import { fetchTransactionSupportedCountries } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const transactionSupportedCountriesQuery = ( locale?: string ) =>
	queryOptions( {
		queryKey: [ 'me', 'transactions', 'supported-countries', locale ?? '' ],
		queryFn: () => fetchTransactionSupportedCountries( locale ),
	} );
