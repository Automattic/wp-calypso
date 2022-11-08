import { PLAN_BUSINESS_MONTHLY } from '@automattic/calypso-products';
import { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import { addQueryArgs } from '@wordpress/url';
import page from 'page';
import 'calypso/state/themes/init';
import { cartManagerClient } from 'calypso/my-sites/checkout/cart-manager-client';
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

		const isSiteEligibleForManagedExternalThemes = getIsSiteEligibleForManagedExternalThemes(
			getState(),
			siteId
		);
		// TODO: use the marketplaceThemeProduct function from #69831
		const externalManagedThemeProduct = {
			product_slug: themeId,
		};

		const cartItems: Array< MinimalRequestCartProduct > = [ externalManagedThemeProduct ];

		if ( ! isSiteEligibleForManagedExternalThemes ) {
			cartItems.push( { product_slug: PLAN_BUSINESS_MONTHLY } );
		}

		const { origin = 'https://wordpress.com' } =
			typeof window !== 'undefined' ? window.location : {};

		const redirectUrl = addQueryArgs( `/checkout/${ siteSlug }`, {
			redirect_to: `${ origin }/theme/${ themeId }/${ siteSlug }`,
		} );

		dispatch( isLoadingCart( true ) );
		const cartKey = await cartManagerClient.getCartKeyForSiteSlug( siteSlug as string );
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
