import type { ResponseCartProduct } from '@automattic/shopping-cart';

/**
 * A single, ungrouped cart product rendered on its own line.
 */
export interface CartSingleLineItem {
	type: 'product';
	product: ResponseCartProduct;
}

/**
 * A set of cart products that belong to the same domain bundle, rendered as one
 * grouped line item. `products` is ordered primary-first, then companions in
 * their original cart order.
 */
export interface CartBundleLineItem {
	type: 'bundle';
	groupId: string;
	products: ResponseCartProduct[];
}

export type GroupedCartLineItem = CartSingleLineItem | CartBundleLineItem;

/**
 * Fold cart products that share a `domain_bundle_group_id` into a single grouped
 * line item, leaving every other product untouched.
 *
 * The result preserves cart order: a bundle group appears at the position of its
 * first member, and ungrouped products stay exactly where they were. Within a
 * group, the `primary` member is listed first, then companions in cart order.
 *
 * A "group" of fewer than two surviving members is degenerate (the backend
 * enforces all-or-nothing membership, so it shouldn't happen) and is rendered as
 * a plain product rather than as a one-item bundle.
 * @param products The cart's products, in cart order.
 * @returns Render entries in cart order: plain products and bundle groups.
 */
export function groupBundleLineItems( products: ResponseCartProduct[] ): GroupedCartLineItem[] {
	const groupOrder: string[] = [];
	const membersByGroup = new Map< string, ResponseCartProduct[] >();

	for ( const product of products ) {
		const groupId = product.extra?.domain_bundle_group_id;

		if ( ! groupId ) {
			continue;
		}

		if ( ! membersByGroup.has( groupId ) ) {
			membersByGroup.set( groupId, [] );
			groupOrder.push( groupId );
		}

		membersByGroup.get( groupId )?.push( product );
	}

	// Group ids that ended up with a single member fall back to plain products.
	const realBundleGroups = new Set(
		groupOrder.filter( ( groupId ) => ( membersByGroup.get( groupId )?.length ?? 0 ) >= 2 )
	);

	const entries: GroupedCartLineItem[] = [];
	const emittedGroups = new Set< string >();

	for ( const product of products ) {
		const groupId = product.extra?.domain_bundle_group_id;

		if ( ! groupId || ! realBundleGroups.has( groupId ) ) {
			entries.push( { type: 'product', product } );
			continue;
		}

		// Emit the whole bundle once, at the position of its first member.
		if ( emittedGroups.has( groupId ) ) {
			continue;
		}

		emittedGroups.add( groupId );
		entries.push( {
			type: 'bundle',
			groupId,
			products: orderBundleMembers( membersByGroup.get( groupId ) ?? [] ),
		} );
	}

	return entries;
}

/**
 * Order a bundle's members primary-first, preserving the original cart order for
 * everything else (companions and any untagged members).
 * @param members The bundle's members, in cart order.
 * @returns The members with the `primary` role moved to the front.
 */
function orderBundleMembers( members: ResponseCartProduct[] ): ResponseCartProduct[] {
	const primaries = members.filter(
		( product ) => product.extra?.domain_bundle_role === 'primary'
	);
	const rest = members.filter( ( product ) => product.extra?.domain_bundle_role !== 'primary' );

	return [ ...primaries, ...rest ];
}
