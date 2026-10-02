import { MAX_CART_ITEM_QUANTITY } from 'calypso/dashboard/agency/marketplace/products/use-shopping-cart';
import {
	buildA4ADashboardLink,
	isAllowedA4ADashboardHostname,
} from 'calypso/dashboard/app-a4a/routing';
import type { AgencyCheckoutTerm } from './billing-product-id';

/** The checkout an agency pays its own dashboard cart on. */
export const AGENCY_CHECKOUT_PATH = '/checkout/agency/purchase';

/** Where a paid cart lands when the dashboard gave no return URL. */
const DEFAULT_RETURN_PATH = '/purchases';

export interface AgencyCartEntry {
	slug: string;
	quantity: number;
}

export interface AgencyCheckoutParams {
	entries: AgencyCartEntry[];
	term: AgencyCheckoutTerm;
	redirectTo: string;
	cancelTo?: string;
}

/**
 * Parses the `products` query param the dashboard cart sends:
 * `slug:quantity,slug:quantity`. A missing or invalid quantity counts as one,
 * and a quantity above what a cart line can hold is brought down to it.
 */
export function parseAgencyCartEntries( products: string | null | undefined ): AgencyCartEntry[] {
	if ( ! products ) {
		return [];
	}
	return products
		.split( ',' )
		.map( ( entry ) => {
			const [ slug = '', quantity ] = entry.split( ':' );
			return {
				slug: slug.trim(),
				quantity: Math.min( MAX_CART_ITEM_QUANTITY, Math.max( 1, parseInt( quantity, 10 ) || 1 ) ),
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
	try {
		const { protocol, hostname } = new URL( url );
		if ( [ 'http:', 'https:' ].includes( protocol ) && isAllowedA4ADashboardHostname( hostname ) ) {
			return url;
		}
	} catch {
		// Not an absolute URL.
	}
	return undefined;
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
