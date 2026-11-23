import type { SitelessCheckoutType } from '@automattic/shopping-cart';

/**
 * Studio checkout is the WordPress.com siteless checkout under its own brand, so it
 * takes the same cart, site and thank-you handling as `wpcom`.
 */
export function isWpcomSitelessCheckoutType( type: SitelessCheckoutType ): boolean {
	return type === 'wpcom' || type === 'studio';
}
