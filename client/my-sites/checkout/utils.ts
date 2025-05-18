import {
	isMonthly,
	isWpComPlan,
	getMonthlyPlanByYearly,
	type PlanSlug,
} from '@automattic/calypso-products';
import { Plans } from '@automattic/data-stores';
import { doesStringResembleDomain } from '@automattic/onboarding';
import { ResponseCartProduct } from '@automattic/shopping-cart';
import { translate } from 'i18n-calypso';
import { useMemo } from 'react';
import { untrailingslashit } from 'calypso/lib/route';
import useCheckPlanAvailabilityForPurchase from 'calypso/my-sites/plans-features-main/hooks/use-check-plan-availability-for-purchase';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import type { Context } from '@automattic/calypso-router';

/**
 * Return the product slug or product alias from a checkout route.
 *
 * Checkout routes support including a product slug (eg: `value_bundle`) or
 * alias (eg: `premium`) in the URL. The most common checkout route uses the
 * format `/checkout/:site/:product`, but it also supports the path
 * `/checkout/:product/:site`.
 *
 * Checkout also supports routes that only include one or the other, using the
 * formats `/checkout/:product` and `/checkout/:site`.
 *
 * This function tries to determine which part of the path is the product, if
 * any, and return it. It will return an empty string if no product is found.
 *
 * Some examples of valid paths:
 *
 * 1. `/checkout/example.com` (path contains a domain)
 * 2. `/checkout/no-adverts%25no-adverts.php` (path contains a product)
 * 3. `/checkout/domain-mapping:example.com` (path contains a product)
 * 4. `/checkout/example.com::blog` (path contains a domain)
 * 5. `/checkout/example.com::blog/pro` (path contains a domain followed by a product)
 * 6. `/checkout/pro/example.com::blog` (path contains a product followed by a domain)
 */
export function getProductSlugFromContext( context: Context ): string | undefined {
	const { params, store, pathname } = context;
	const { domainOrProduct, product, productSlug } = params;
	const state = store.getState();
	const selectedSite = getSelectedSite( state );
	const isGiftPurchase = pathname.includes( '/gift/' );

	// Jetpack siteless checkout routes always use `:productSlug` in the path.
	if ( isContextJetpackSitelessCheckout( context ) ) {
		return productSlug;
	}

	// Gift purchase routes always use `:product` in the path.
	if ( isGiftPurchase ) {
		return product;
	}

	if ( ! domainOrProduct && ! product ) {
		return '';
	}

	// If one matches the selected site, return the other.
	if ( domainOrProduct && selectedSite?.slug && selectedSite.slug === domainOrProduct ) {
		return product || '';
	}

	if ( product && selectedSite?.slug && selectedSite.slug === product ) {
		return domainOrProduct || '';
	}

	// If there is no selected site, there will never be a `product`, and the
	// `domainOrProduct` must be a product slug because a domain would have
	// selected a site.
	if ( ! selectedSite?.slug ) {
		return domainOrProduct || '';
	}

	// If one string is a valid URL, and there is another, use the other one.
	if ( domainOrProduct ) {
		const isDomain = doesStringResembleDomain( domainOrProduct );
		if ( isDomain && product ) {
			return product;
		}
		if ( ! isDomain ) {
			return domainOrProduct;
		}
	}

	if ( product ) {
		const isDomain = doesStringResembleDomain( product );
		if ( isDomain && domainOrProduct ) {
			return domainOrProduct;
		}
		if ( ! isDomain ) {
			return product;
		}
	}

	return '';
}

/**
 * Prepends "http(s)" to user-supplied URL if protocol is missing.
 * @param {string} inputUrl User-supplied URL
 * @param {?boolean} httpsIsDefault Default to 'https' if true vs 'http' if false
 * @returns {string} URL string with http(s) included
 */
export function addHttpIfMissing( inputUrl: string, httpsIsDefault = true ): string {
	const scheme = httpsIsDefault ? 'https' : 'http';
	let url = inputUrl.trim().toLowerCase();

	if ( url && url.substr( 0, 4 ) !== 'http' ) {
		url = `${ scheme }://` + url;
	}
	return untrailingslashit( url );
}

export function isContextJetpackSitelessCheckout( context: Context ): boolean {
	const hasJetpackPurchaseToken = Boolean( context.query.purchasetoken );
	const hasJetpackPurchaseNonce = Boolean( context.query.purchaseNonce );
	const isUserComingFromLoginForm = context.query?.flow === 'coming_from_login';
	const isUserComingFromPlansPage = [ 'jetpack-plans', 'jetpack-connect-plans' ].includes(
		context.query?.source
	);
	const state = context.store.getState();
	const isLoggedOut = ! isUserLoggedIn( state );

	if ( ! context.pathname.includes( '/checkout/jetpack' ) ) {
		return false;
	}
	if ( ! isLoggedOut && ! isUserComingFromLoginForm && ! isUserComingFromPlansPage ) {
		return false;
	}
	if ( ! hasJetpackPurchaseToken && ! hasJetpackPurchaseNonce ) {
		return false;
	}
	return true;
}

export function isContextSourceMyJetpack( context: Context ): boolean {
	return context.query?.source === 'my-jetpack';
}

export function getAffiliateCouponLabel(): string {
	// translators: The label of the coupon line item in checkout
	return translate( 'Exclusive Offer Applied' );
}

/**
 * Calculate the equivalent monthly total prices for non-monthly WordPress.com plans from the passed
 * cart. For each eligible product it'd determine the equivalent monthly plan and return the monthly
 * plan price multiplied by the number of months in the yearly (or longer) plan.
 * Used for demonstrating the benefits of purchasing longer-term plans.
 *
 * @param products - Array of `ResponseCartProduct` items.
 *
 * @returns An object where each key is an eligible plan slug from the cart and the value is the
 *          calculated total cost as if it was billed monthly.
 */
export function useEquivalentMonthlyTotals( products: Array< ResponseCartProduct > ): {
	[ key: string ]: number;
} {
	const isEligibleProduct = ( product: ResponseCartProduct ) =>
		isWpComPlan( product?.product_slug ) && ! isMonthly( product?.product_slug );

	const monthlyProductSlugs = useMemo( () => {
		return products
			.filter( isEligibleProduct )
			.reduce( ( slugs: PlanSlug[], product: ResponseCartProduct ) => {
				if ( ! slugs.includes( product.product_slug as PlanSlug ) ) {
					slugs.push( getMonthlyPlanByYearly( product.product_slug ) as PlanSlug );
				}
				return slugs;
			}, [] );
	}, [ products ] );
	const pricing =
		Plans.usePricingMetaForGridPlans( {
			planSlugs: monthlyProductSlugs,
			siteId: undefined,
			coupon: undefined,
			useCheckPlanAvailabilityForPurchase,
		} ) || {};
	const monthlyEquivalentTotals = useMemo( () => {
		return products.filter( isEligibleProduct ).reduce(
			( prices, product ) => {
				const monthlyPlan = getMonthlyPlanByYearly( product.product_slug );
				prices[ product.product_slug as PlanSlug ] =
					( product.months_per_bill_period ?? 0 ) *
					( pricing[ monthlyPlan ]?.originalPrice?.monthly ?? 0 );
				return prices;
			},
			{} as Record< PlanSlug, number >
		);
	}, [ products, pricing ] );
	return monthlyEquivalentTotals;
}
