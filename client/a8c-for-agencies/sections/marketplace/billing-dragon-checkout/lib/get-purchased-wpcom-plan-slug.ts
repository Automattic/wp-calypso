import { isWPCOMHostingProduct } from '../../lib/hosting';
import type { ShoppingCartItem } from '../../types';

/**
 * A cart holding a WordPress.com plan lands on the "Needs setup" page rather
 * than the licenses list, so the agency can provision the site right away. The
 * returned slug is what that page's confirmation banner reports to Tracks.
 */
export default function getPurchasedWPCOMPlanSlug( cartItems: ShoppingCartItem[] ): string | null {
	return cartItems.find( ( { slug } ) => isWPCOMHostingProduct( slug ) )?.slug ?? null;
}
