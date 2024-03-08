import {
	PLAN_ECOMMERCE_TRIAL_MONTHLY,
	camelOrSnakeSlug,
	isEcommerce,
	isWooExpressPlan,
} from '@automattic/calypso-products';
import { ResponseCart, ResponseCartProduct } from '@automattic/shopping-cart';

/**
 * Checks whether the upgrade product is valid for upsell tracking.
 * There may be more conditions, for now it's just checking whether
 * it's any ecommerce plan.
 * @param product ResponseCartProduct
 * @returns { boolean }
 */
export const isValidWooExpressUpsell = ( product: ResponseCartProduct ): boolean => {
	return isEcommerce( product ) || isWooExpressPlan( camelOrSnakeSlug( product ) );
};

/**
 * Checks if the cart contains an upgrade to a valid plan, and whether the site has a woo trial.
 * If both are true, we'll return true. A valid upgrade assumes that the site currently (pre upgrade)
 * has a Woo Experss trial, and that the upgrade is to a valid ecommerce plan as defined by the return
 * value of `isEcommerce`.
 * @param cart ResponseCart
 * @param sitePlanSlug SiteDetails
 * @returns { boolean }
 */
export const isWooExpressUpgrade = ( cart: ResponseCart, sitePlanSlug?: string ): boolean => {
	// Does the current site have a plan and is it Woo Express trial pre-upgrade?
	if ( ! sitePlanSlug || sitePlanSlug !== PLAN_ECOMMERCE_TRIAL_MONTHLY ) {
		return false;
	}

	// Does the cart contain an upsell we care about? I.e. is it an ecommerce plan?
	return cart.products.some( ( product ) => isValidWooExpressUpsell( product ) );
};
