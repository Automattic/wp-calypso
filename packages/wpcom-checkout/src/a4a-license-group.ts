import type { GroupedCartLineItem } from './group-bundle-line-items';
import type { ResponseCartProduct } from '@automattic/shopping-cart';

/**
 * A license bought through Automattic for Agencies, by the agency or by a
 * client paying its referral. Each license is its own cart line.
 */
export function isA4ALicenseProduct( product: ResponseCartProduct ): boolean {
	return Boolean( product.extra?.isA4ASitelessCheckout );
}

/** Licenses are the same when they are the same product, term and target site. */
function getLicenseKey( product: ResponseCartProduct ): string {
	return [
		product.product_slug,
		product.product_id,
		product.extra?.a4a_pressable_site_domain ?? '',
	].join( ':' );
}

/** Several licenses of one product in an A4A cart, shown as one line. */
export interface CartA4ALicenseGroup {
	type: 'a4a-licenses';
	key: string;
	products: ResponseCartProduct[];
}

export type A4AGroupedCartLineItem = GroupedCartLineItem | CartA4ALicenseGroup;

function getLicenseGroups( products: ResponseCartProduct[] ): Map< string, ResponseCartProduct[] > {
	const groups = new Map< string, ResponseCartProduct[] >();
	products.filter( isA4ALicenseProduct ).forEach( ( product ) => {
		const key = getLicenseKey( product );
		groups.set( key, [ ...( groups.get( key ) ?? [] ), product ] );
	} );
	return groups;
}

/**
 * Folds the A4A licenses of the same product into one entry at the place
 * of the first, leaving every other entry as it is. A product bought once
 * stays a plain line.
 */
export function groupA4ALicenses( entries: GroupedCartLineItem[] ): A4AGroupedCartLineItem[] {
	const groups = getLicenseGroups(
		entries.flatMap( ( entry ) => ( entry.type === 'product' ? [ entry.product ] : [] ) )
	);
	const placed = new Set< string >();

	return entries.flatMap( ( entry ): A4AGroupedCartLineItem[] => {
		if ( entry.type !== 'product' || ! isA4ALicenseProduct( entry.product ) ) {
			return [ entry ];
		}
		const key = getLicenseKey( entry.product );
		const members = groups.get( key ) ?? [];
		if ( members.length < 2 ) {
			return [ entry ];
		}
		if ( placed.has( key ) ) {
			return [];
		}
		placed.add( key );
		return [ { type: 'a4a-licenses', key, products: members } ];
	} );
}
