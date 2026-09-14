import type { SelectedDomain } from '../../page/types';

/**
 * A single, ungrouped cart item rendered on its own row.
 */
export interface SingleCartEntry {
	type: 'item';
	item: SelectedDomain;
}

/**
 * A set of cart items that belong to the same domain bundle, rendered as one
 * grouped row with a single summed price and a single remove action. `members`
 * is ordered primary-first, then companions in their original cart order.
 */
export interface BundleCartEntry {
	type: 'bundle';
	groupId: string;
	price: string;
	members: SelectedDomain[];
}

export type CartEntry = SingleCartEntry | BundleCartEntry;

/**
 * Fold cart items that share a bundle group id into a single grouped entry,
 * leaving every other item untouched.
 *
 * The result preserves cart order: a bundle group appears at the position of
 * its first member, and ungrouped items stay exactly where they were. Within a
 * group, the primary member is listed first, then companions in cart order.
 *
 * A "group" of fewer than two surviving members is degenerate (the backend
 * enforces all-or-nothing membership, so it shouldn't happen) and is rendered
 * as a plain item rather than as a one-item bundle.
 * @param items The cart's items, in cart order.
 * @returns Render entries in cart order: plain items and bundle groups.
 */
export function groupCartItems( items: SelectedDomain[] ): CartEntry[] {
	const membersByGroup = new Map< string, SelectedDomain[] >();

	for ( const item of items ) {
		const groupId = item.bundle?.groupId;

		if ( ! groupId ) {
			continue;
		}

		if ( ! membersByGroup.has( groupId ) ) {
			membersByGroup.set( groupId, [] );
		}

		membersByGroup.get( groupId )?.push( item );
	}

	const entries: CartEntry[] = [];
	const emittedGroups = new Set< string >();

	for ( const item of items ) {
		const bundle = item.bundle;
		const members = bundle ? membersByGroup.get( bundle.groupId ) ?? [] : [];

		// Group ids that ended up with a single member fall back to plain items.
		if ( ! bundle || members.length < 2 ) {
			entries.push( { type: 'item', item } );
			continue;
		}

		// Emit the whole bundle once, at the position of its first member.
		if ( emittedGroups.has( bundle.groupId ) ) {
			continue;
		}

		emittedGroups.add( bundle.groupId );
		entries.push( {
			type: 'bundle',
			groupId: bundle.groupId,
			price: bundle.price,
			members: orderBundleMembers( members ),
		} );
	}

	return entries;
}

/**
 * Order a bundle's members primary-first, preserving the original cart order
 * for everything else, mirroring `orderBundleMembers` in wpcom-checkout's
 * `groupBundleLineItems` so the panel lists members in the same order as the
 * masterbar mini-cart and checkout surfaces.
 * @param members The bundle's members, in cart order.
 * @returns The members with the primary role moved to the front.
 */
function orderBundleMembers( members: SelectedDomain[] ): SelectedDomain[] {
	const primaries = members.filter( ( member ) => member.bundle?.isPrimary );
	const rest = members.filter( ( member ) => ! member.bundle?.isPrimary );

	return [ ...primaries, ...rest ];
}
