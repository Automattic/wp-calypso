import { translate } from 'i18n-calypso';
import type { AdminMenuItem } from 'calypso/state/admin-menu/types';

// The WooCommerce menu item arrives as `woocommerce` from the admin-menu API
// and as `woo-php` from the static fallback data; both point at wc-admin.
const WOOCOMMERCE_ITEM_SLUGS = [ 'woocommerce', 'woo-php' ];

/**
 * Relabel the WooCommerce sidebar item to "Store setup". Intended for
 * eCommerce-plan sites in the WordPress.com context, where the WooCommerce
 * entry is really the store-setup destination.
 */
export function relabelWooCommerceAsStoreSetup(
	menuItems: readonly AdminMenuItem[] | null | undefined
): AdminMenuItem[] {
	if ( ! Array.isArray( menuItems ) ) {
		return [];
	}

	return menuItems.map( ( item ) =>
		WOOCOMMERCE_ITEM_SLUGS.includes( item.slug )
			? { ...item, title: translate( 'Store setup' ) }
			: item
	);
}
