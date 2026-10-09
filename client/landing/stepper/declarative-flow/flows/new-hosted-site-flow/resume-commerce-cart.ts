import {
	isDomainMapping,
	isDomainRegistration,
	isDomainTransfer,
	isDotComPlan,
} from '@automattic/calypso-products';
import { NEW_HOSTED_SITE_FLOW } from '@automattic/onboarding';
import cartManagerClient from '@automattic/onboarding/src/cart/create-cart-manager-client';
import { createRequestCartProduct } from '@automattic/shopping-cart';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';

export async function resumeCommerceCart(
	siteSlug: string,
	plan: MinimalRequestCartProduct,
	domains: MinimalRequestCartProduct[]
) {
	const cartKey = await cartManagerClient.getCartKeyForSiteSlug( siteSlug );
	const manager = cartManagerClient.forCartKey( cartKey );
	const cart = await manager.fetchInitialCart();
	const otherProducts = cart.products.filter(
		( product ) =>
			! isDotComPlan( product ) &&
			! isDomainRegistration( product ) &&
			! isDomainMapping( product ) &&
			! isDomainTransfer( product )
	);
	await manager.actions.replaceProductsInCart(
		[ ...otherProducts, plan, ...domains ].map( ( product ) =>
			createRequestCartProduct( {
				...product,
				extra: { ...product.extra, context: 'signup', signup_flow: NEW_HOSTED_SITE_FLOW },
			} )
		)
	);
}
