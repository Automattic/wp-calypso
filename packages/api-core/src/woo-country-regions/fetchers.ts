import { wpcom } from '../wpcom-fetcher';

/**
 * Countries and their regions, keyed by ISO code ("US", "US:TX") with
 * localized labels ("United States (US)", "United States (US) — Texas").
 */
export async function fetchWooCountryRegions(): Promise< Record< string, string > > {
	return wpcom.req.get( {
		path: '/woocommerce/countries/regions/',
		apiNamespace: 'wpcom/v2',
	} );
}
