import { wpcom } from './wpcom-fetcher';
import type { CountryListItem } from './domain-supported-countries/types';

/**
 * The countries a payment can be made from, with the tax fields each one needs.
 *
 * Distinct from `/domains/supported-countries`, which lists the countries a
 * domain contact may be registered in.
 */
export async function fetchTransactionSupportedCountries(
	locale?: string
): Promise< CountryListItem[] > {
	return await wpcom.req.get(
		{
			path: '/me/transactions/supported-countries',
			apiVersion: '1.1',
		},
		locale ? { locale } : undefined
	);
}
