import { useQuery, UseQueryResult, UseQueryOptions } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

type WooCountries = Record< string, string >;

export function useCountries(
	localeSlug: string | null = 'en',
	queryOptions: Omit< UseQueryOptions< any, Error, WooCountries >, 'queryKey' > = {}
): UseQueryResult< WooCountries > {
	return useQuery< any, Error, WooCountries >( {
		queryKey: [ 'countries', localeSlug ],
		queryFn: () =>
			wpcom.req.get( `/woocommerce/countries/regions/?_locale=${ localeSlug }`, {
				apiNamespace: 'wpcom/v2',
			} ),
		staleTime: Infinity,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		...queryOptions,
		meta: {
			...queryOptions.meta,
		},
	} );
}
