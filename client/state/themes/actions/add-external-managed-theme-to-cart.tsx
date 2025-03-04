import {
	PLAN_BUSINESS,
	TERM_ANNUALLY,
	findFirstSimilarPlanKey,
	getPlan,
	isFreePlan,
} from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import 'calypso/state/themes/init';
import { marketplaceThemeProduct } from 'calypso/lib/cart-values/cart-items';
import { cartManagerClient } from 'calypso/my-sites/checkout/cart-manager-client';
import { clearSignupDestinationCookie } from 'calypso/signup/storageUtils';
import { getProductsByBillingSlug } from 'calypso/state/products-list/selectors';
import { getProductBillingSlugByThemeId } from 'calypso/state/products-list/selectors/get-product-billing-slug-by-theme-id';
import { getSitePlanSlug, getSiteSlug } from 'calypso/state/sites/selectors';
import {
	isExternallyManagedTheme as getIsExternallyManagedTheme,
	isSiteEligibleForManagedExternalThemes as getIsSiteEligibleForManagedExternalThemes,
	isPremiumThemeAvailable,
} from 'calypso/state/themes/selectors';
import { CalypsoDispatch } from 'calypso/state/types';
import { AppState } from 'calypso/types';
import { THEMES_LOADING_CART } from '../action-types';
import { getPreferredBillingCycleProductSlug } from '../theme-utils';

const isLoadingCart = ( isLoading: boolean ) => ( dispatch: CalypsoDispatch ) => {
	dispatch( {
		type: THEMES_LOADING_CART,
		isLoading,
	} );
};

/**
 * Add the business plan and/or the external theme to the cart and redirect to checkout.
 * This action also manages the loading state of the cart. We'll use it to lock the CTA
 * button while the cart is being updated.
 * @param themeId Theme ID to add to cart
 * @param siteId
 * @returns
 */
export function addExternalManagedThemeToCart( themeId: string, siteId: number ) {
	return async ( dispatch: CalypsoDispatch, getState: AppState ) => {
		const state = getState();
		const isExternallyManagedTheme = getIsExternallyManagedTheme( state, themeId );

		if ( ! isExternallyManagedTheme ) {
			throw new Error( 'Theme is not externally managed' );
		}

		const isThemePurchased = isPremiumThemeAvailable( state, themeId, siteId );

		if ( isThemePurchased ) {
			throw new Error( 'Theme is already purchased' );
		}

		const siteSlug = getSiteSlug( state, siteId );

		if ( ! siteSlug ) {
			throw new Error( 'Site could not be found matching id ' + siteId );
		}

		const products = getProductsByBillingSlug(
			state,
			getProductBillingSlugByThemeId( state, themeId )
		);

		if ( undefined === products || products.length === 0 ) {
			throw new Error( 'No products available' );
		}

		const currentPlanSlug = getSitePlanSlug( state, siteId );
		let requiredTerm = TERM_ANNUALLY;
		if ( currentPlanSlug && ! isFreePlan( currentPlanSlug ) ) {
			requiredTerm = getPlan( currentPlanSlug )?.term || TERM_ANNUALLY;
		}
		const requiredPlanSlug =
			findFirstSimilarPlanKey( PLAN_BUSINESS, { term: requiredTerm } ) || PLAN_BUSINESS;

		const productSlug = getPreferredBillingCycleProductSlug( products, requiredPlanSlug );

		const externalManagedThemeProduct = marketplaceThemeProduct( productSlug );

		/**
		 * This holds the products that will be added to the cart. We always want to add the
		 * theme product, but we only want to add the business plan if the site is not eligible
		 */
		const cartItems: Array< MinimalRequestCartProduct > = [ externalManagedThemeProduct ];

		/**
		 * If the site is not eligible for the external themes, means that it doesn't have a business plan.
		 * We need to add the business plan to the cart.
		 */
		const isSiteEligibleForManagedExternalThemes = getIsSiteEligibleForManagedExternalThemes(
			state,
			siteId
		);

		if ( ! isSiteEligibleForManagedExternalThemes ) {
			cartItems.push( {
				product_slug: requiredPlanSlug,
			} );
		}

		dispatch( isLoadingCart( true ) );
		const cartKey = await cartManagerClient.getCartKeyForSiteSlug( siteSlug );
		cartManagerClient
			.forCartKey( cartKey )
			.actions.addProductsToCart( cartItems )
			.then( () => {
				// If there's been a site created recently then this cookie will still contain
				// the post-checkout destination from that site-creation flow. We don't want
				// that flow's destination to be used here.
				clearSignupDestinationCookie();

				page( `/checkout/${ siteSlug }` );
			} )
			.finally( () => {
				dispatch( isLoadingCart( false ) );
			} );
	};
}
