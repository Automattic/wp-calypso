import { PLAN_ECOMMERCE_TRIAL_MONTHLY, isEcommerce } from '@automattic/calypso-products';
import { SiteDetails } from '@automattic/data-stores/src';
import { ResponseCart, ResponseCartProduct } from '@automattic/shopping-cart';

/**
 * Checks whether the upgrade product is valid for upsell tracking.
 * There may be more conditions, for now it's just checking whether
 * it's any ecommerce plan.
 *
 * @param product ResponseCartProduct
 * @returns { boolean }
 */
const isValidWooExpressUpsell = ( product: ResponseCartProduct ): boolean => {
	return isEcommerce( product );
};

/**
 * Checks if the cart contains an upgrade to a valid plan, and whether the site has a woo trial.
 * If both are true, we'll return true. A valid upgrade assumes that the site currently (pre upgrade)
 * has a Woo Experss trial, and that the upgrade is to a valid ecommerce plan as defined by the return
 * value of `isEcommerce`.
 *
 * @param cart ResponseCart
 * @param siteDetails SiteDetails
 * @returns { boolean }
 */
export const isWooExpressUpgrade = ( cart: ResponseCart, siteDetails: SiteDetails ): boolean => {
	const sitePlanSlug = siteDetails?.plan?.product_slug;

	if ( ! sitePlanSlug ) {
		return false;
	}

	// Does the cart contain an upsell we care about? I.e. is it an ecommerce plan?
	const cartContainsValidUpsell = cart.products.some( ( product ) =>
		isValidWooExpressUpsell( product )
	);

	// And does the current site have a Woo Express trial pre-upgrade?
	return sitePlanSlug === PLAN_ECOMMERCE_TRIAL_MONTHLY && cartContainsValidUpsell;
};
