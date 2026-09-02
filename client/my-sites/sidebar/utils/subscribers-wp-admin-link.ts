import type { AdminMenuItem } from 'calypso/state/admin-menu/types';

/**
 * The slug the admin-menu API (and the static fallback) use for the
 * "Subscribers" sidebar item. It lives as a submenu-item under "Users".
 */
const SUBSCRIBERS_SLUG = 'subscribers';

/**
 * Rollout cohort size. `1 / SUBSCRIBERS_WP_ADMIN_LINK_BUCKET_SIZE` of sites land
 * in the bucket — i.e. `10` ≈ 10% of sites.
 */
export const SUBSCRIBERS_WP_ADMIN_LINK_BUCKET_SIZE = 10;

/**
 * Deterministic ~10% cohort keyed on the site (blog) id. The same site always
 * resolves to the same answer, so the sidebar link never flips between loads.
 * @param siteId The selected site id.
 * @returns Whether the site is in the wp-admin Subscribers link cohort.
 */
export function isSiteInSubscribersWpAdminLinkBucket( siteId: number | null | undefined ): boolean {
	return (
		Number.isInteger( siteId ) && ( siteId as number ) % SUBSCRIBERS_WP_ADMIN_LINK_BUCKET_SIZE === 0
	);
}

/**
 * Returns a copy of the menu tree with the "Subscribers" item's URL rewritten
 * to `wpAdminUrl`. Recurses into `children` because Subscribers is nested under
 * the "Users" menu. When no Subscribers item is present the input is returned
 * unchanged.
 * @param menuItems The base menu items (API response or static fallback).
 * @param wpAdminUrl The absolute wp-admin URL to point Subscribers at.
 * @returns The (possibly) rewritten menu items.
 */
export function rewriteSubscribersMenuLink(
	menuItems: readonly AdminMenuItem[] | null | undefined,
	wpAdminUrl: string
): AdminMenuItem[] {
	if ( ! Array.isArray( menuItems ) ) {
		return [];
	}

	let changed = false;
	const rewritten = menuItems.map( ( item ) => {
		const children = Array.isArray( item.children )
			? rewriteSubscribersMenuLink( item.children, wpAdminUrl )
			: item.children;

		const childrenChanged = children !== item.children;
		const isSubscribers = item.slug === SUBSCRIBERS_SLUG && item.url !== wpAdminUrl;

		if ( ! isSubscribers && ! childrenChanged ) {
			return item;
		}

		changed = true;
		return {
			...item,
			children,
			...( isSubscribers ? { url: wpAdminUrl } : {} ),
		};
	} );

	return changed ? rewritten : menuItems.slice();
}
