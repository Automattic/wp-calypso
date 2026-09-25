import {
	buildA4ADashboardLink,
	isAllowedA4ADashboardHostname,
} from 'calypso/dashboard/app-a4a/routing';

/** Where a paid cart lands when the dashboard gave no return URL. */
const DEFAULT_RETURN_PATH = '/marketplace/purchases';

export interface AgencyCartEntry {
	slug: string;
	quantity: number;
	/** The WordPress.com billing product for this line, already resolved by the dashboard. */
	productId: number;
}

export interface AgencyCheckoutParams {
	agencyId: number;
	entries: AgencyCartEntry[];
	redirectTo: string;
	cancelTo?: string;
}

/**
 * Parses the `products` query param the dashboard cart sends:
 * `slug:quantity:productId,slug:quantity:productId`. A missing or invalid
 * quantity counts as one; a line without a product id is dropped.
 */
export function parseAgencyCartEntries( products: string | null | undefined ): AgencyCartEntry[] {
	if ( ! products ) {
		return [];
	}
	return products
		.split( ',' )
		.map( ( entry ) => {
			const [ slug = '', quantity, productId ] = entry.split( ':' );
			return {
				slug: slug.trim(),
				quantity: Math.max( 1, parseInt( quantity, 10 ) || 1 ),
				productId: parseInt( productId, 10 ) || 0,
			};
		} )
		.filter( ( entry ) => entry.slug !== '' && entry.productId > 0 );
}

/**
 * Both return URLs come from the query string, so only the Automattic for
 * Agencies dashboard hosts may receive the user back.
 */
export function getAllowedDashboardUrl( url: string | null | undefined ): string | undefined {
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

export function getAgencyCheckoutParams( search: string ): AgencyCheckoutParams {
	const params = new URLSearchParams( search );
	return {
		agencyId: parseInt( params.get( 'agency_id' ) ?? '', 10 ) || 0,
		entries: parseAgencyCartEntries( params.get( 'products' ) ),
		redirectTo:
			getAllowedDashboardUrl( params.get( 'redirect_to' ) ) ??
			buildA4ADashboardLink( DEFAULT_RETURN_PATH ),
		cancelTo: getAllowedDashboardUrl( params.get( 'cancel_to' ) ),
	};
}
