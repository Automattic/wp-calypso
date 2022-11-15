import { PLAN_BUSINESS_MONTHLY } from '@automattic/calypso-products';
import { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import { addQueryArgs } from '@wordpress/url';
import page from 'page';
import 'calypso/state/themes/init';
import { marketplaceThemeProduct } from 'calypso/lib/cart-values/cart-items';
import { cartManagerClient } from 'calypso/my-sites/checkout/cart-manager-client';
import { marketplaceThemeBillingProductSlug } from 'calypso/my-sites/themes/helpers';
import { getProductsByBillingSlug } from 'calypso/state/products-list/selectors';
import { ProductListItem } from 'calypso/state/products-list/selectors/get-products-list';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import {
	isExternallyManagedTheme as getIsExternallyManagedTheme,
	isSiteEligibleForManagedExternalThemes as getIsSiteEligibleForManagedExternalThemes,
	isPremiumThemeAvailable,
} from 'calypso/state/themes/selectors';
import { CalypsoDispatch } from 'calypso/state/types';
import { AppState } from 'calypso/types';
import { THEMES_LOADING_CART } from '../action-types';

const isLoadingCart = ( isLoading: boolean ) => ( dispatch: CalypsoDispatch ) => {
	dispatch( {
		type: THEMES_LOADING_CART,
		isLoading,
	} );
};

/**
 * Get the preferred product slug from the products list.
 *
 * @param products list of products
 * @returns string
 */
function getPreferredBillingCycleProductSlug( products: Array< ProductListItem > ): string {
	if ( products.length === 0 ) {
		throw new Error( 'No products available' );
	}
	const preferredBillingCycle = 'month';
	const preferredProduct = products.find(
		( product ) => product.product_term === preferredBillingCycle
	);
	return preferredProduct?.product_slug ?? products[ 0 ].product_slug;
}

/**
 * Add the business plan and/or the external theme to the cart and redirect to checkout.
 * This action also manages the loading state of the cart. We'll use it to lock the CTA
 * button while the cart is being updated.
 *
 * @param themeId Theme ID to add to cart
 * @param siteId
 * @returns
 */
export function addExternalManagedThemeToCart( themeId: string, siteId: number ) {
	return async ( dispatch: CalypsoDispatch, getState: AppState ) => {
		const isExternallyManagedTheme = getIsExternallyManagedTheme( getState(), themeId );

		if ( ! isExternallyManagedTheme ) {
			throw new Error( 'Theme is not externally managed' );
		}

		const isThemePurchased = isPremiumThemeAvailable( getState(), themeId, siteId );

		if ( isThemePurchased ) {
			throw new Error( 'Theme is already purchased' );
		}

		const siteSlug = getSiteSlug( getState(), siteId );

		if ( ! siteSlug ) {
			throw new Error( 'Site could not be found matching id ' + siteId );
		}

		const products = getProductsByBillingSlug(
			getState(),
			marketplaceThemeBillingProductSlug( themeId )
		);

		if ( undefined === products || products.length === 0 ) {
			throw new Error( 'No products available' );
		}

		const productSlug = getPreferredBillingCycleProductSlug( products );

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
			getState(),
			siteId
		);

		if ( ! isSiteEligibleForManagedExternalThemes ) {
			cartItems.push( { product_slug: PLAN_BUSINESS_MONTHLY } );
		}

		const { origin = 'https://wordpress.com' } =
			typeof window !== 'undefined' ? window.location : {};

		const redirectUrl = addQueryArgs( `/checkout/${ siteSlug }`, {
			redirect_to: `${ origin }/theme/${ themeId }/${ siteSlug }`,
		} );

		dispatch( isLoadingCart( true ) );
		const cartKey = await cartManagerClient.getCartKeyForSiteSlug( siteSlug );
		cartManagerClient
			.forCartKey( cartKey )
			.actions.addProductsToCart( cartItems )
			.then( () => {
				page( redirectUrl );
			} )
			.finally( () => {
				dispatch( isLoadingCart( false ) );
			} );
	};
}