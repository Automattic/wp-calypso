import { decodeSiteDomain } from 'calypso/dashboard/agency/marketplace/products/lib/pressable-memory-addon';
import { MAX_CART_ITEM_QUANTITY } from 'calypso/dashboard/agency/marketplace/products/use-shopping-cart';
import { buildA4ADashboardLink } from 'calypso/dashboard/app-a4a/routing';
import { getUrlOnOrigins } from 'calypso/dashboard/utils/url';
import type { AgencyCheckoutTerm } from './billing-product-id';

/** The checkout an agency pays its own dashboard cart on. */
export const AGENCY_CHECKOUT_PATH = '/checkout/agency/purchase';

/** Where a paid cart lands when the dashboard gave no return URL. */
const DEFAULT_RETURN_PATH = '/purchases';

export interface AgencyCartEntry {
	slug: string;
	quantity: number;
	/** The Pressable site a PHP memory add-on applies to. */
	siteDomain?: string;
}

export interface AgencyCheckoutParams {
	entries: AgencyCartEntry[];
	term: AgencyCheckoutTerm;
	redirectTo: string;
	cancelTo?: string;
}

/**
 * Parses the `products` query param the dashboard cart sends:
 * `slug:quantity,slug:quantity:domain`, where a PHP memory add-on names the
 * Pressable site it applies to. A missing or invalid quantity counts as one,
 * and a quantity above what a cart line can hold is brought down to it.
 */
export function parseAgencyCartEntries( products: string | null | undefined ): AgencyCartEntry[] {
	if ( ! products ) {
		return [];
	}
	return products
		.split( ',' )
		.map( ( entry ) => {
			const [ slug = '', quantity, encodedSiteDomain ] = entry.split( ':' );
			const siteDomain = decodeSiteDomain( encodedSiteDomain );
			return {
				slug: slug.trim(),
				quantity: Math.min( MAX_CART_ITEM_QUANTITY, Math.max( 1, parseInt( quantity, 10 ) || 1 ) ),
				...( siteDomain ? { siteDomain } : {} ),
			};
		} )
		.filter( ( entry ) => entry.slug !== '' );
}

/**
 * Both return URLs come from the query string, so only the Automattic for
 * Agencies dashboard hosts may receive the user back.
 */
export function getAllowedA4ADashboardUrl( url: string | null | undefined ): string | undefined {
	if ( ! url ) {
		return undefined;
	}
	return getUrlOnOrigins( url, a4aDashboardOrigins( url ) );
}

/**
 * The local dev server takes any port, and a Calypso Live preview its own host,
 * since neither is known to the checkout.
 */
function a4aDashboardOrigins( url: string ) {
	let hostname = '';
	let port = '';
	try {
		( { hostname, port } = new URL( url ) );
	} catch {}
	return [
		'https://agencies-beta.automattic.com',
		`http://my.a4a.localhost${ port && `:${ port }` }`,
		...( hostname.endsWith( '-a4a.calypso.live' ) ? [ `https://${ hostname }` ] : [] ),
	];
}

function parseAgencyCheckoutTerm( term: string | null ): AgencyCheckoutTerm {
	return term === 'monthly' ? 'monthly' : 'yearly';
}

export function getAgencyCheckoutParams( search: string ): AgencyCheckoutParams {
	const params = new URLSearchParams( search );
	return {
		entries: parseAgencyCartEntries( params.get( 'products' ) ),
		term: parseAgencyCheckoutTerm( params.get( 'term' ) ),
		redirectTo:
			getAllowedA4ADashboardUrl( params.get( 'redirect_to' ) ) ??
			buildA4ADashboardLink( DEFAULT_RETURN_PATH ),
		cancelTo: getAllowedA4ADashboardUrl( params.get( 'cancel_to' ) ),
	};
}

export type AgencySiteCheckoutParams = Omit< AgencyCheckoutParams, 'entries' >;

/**
 * Where a site checkout sends the user when its site cannot be loaded: the
 * page it was opened from, or the dashboard's sites list.
 */
export function getAgencySiteCheckoutExitUrl( search: string ): string {
	const params = new URLSearchParams( search );
	return (
		getAllowedA4ADashboardUrl( params.get( 'cancel_to' ) ) ?? buildA4ADashboardLink( '/sites' )
	);
}

/**
 * The query string of the checkout for one of the agency's sites, whose plan
 * comes from the path instead. A paid site lands on itself unless the
 * dashboard asked for another page.
 */
export function getAgencySiteCheckoutParams(
	search: string,
	siteSlug: string
): AgencySiteCheckoutParams {
	const params = new URLSearchParams( search );
	return {
		term: parseAgencyCheckoutTerm( params.get( 'term' ) ),
		redirectTo:
			getAllowedA4ADashboardUrl( params.get( 'redirect_to' ) ) ??
			buildA4ADashboardLink( `/sites/${ siteSlug }` ),
		cancelTo: getAllowedA4ADashboardUrl( params.get( 'cancel_to' ) ),
	};
}
