import { isWPCOMHostingProduct } from '../../lib/hosting';
import type { ShoppingCartItem } from '../../types';

/**
 * A cart of only WordPress.com plans lands on the "Needs setup" page rather
 * than the licenses list, so the agency can provision the site right away. The
 * returned slug is what that page's confirmation banner reports to Tracks.
 * A cart that also holds other products returns null: the licenses list is the
 * one place that shows every license left to assign.
 */
export default function getPurchasedWPCOMPlanSlug( cartItems: ShoppingCartItem[] ): string | null {
	if ( ! cartItems.every( ( { slug } ) => isWPCOMHostingProduct( slug ) ) ) {
		return null;
	}
	return cartItems[ 0 ]?.slug ?? null;
}
