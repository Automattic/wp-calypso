import { RazorpayHookProvider } from '@automattic/calypso-razorpay';
import page from '@automattic/calypso-router';
import { StripeHookProvider } from '@automattic/calypso-stripe';
import { CheckoutErrorBoundary } from '@automattic/composite-checkout';
import { createRequestCartProduct, useShoppingCart } from '@automattic/shopping-cart';
import debugFactory from 'debug';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import A4ALogo from 'calypso/a8c-for-agencies/components/a4a-logo';
import { A4A_MARKETPLACE_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { getStripeConfiguration, getRazorpayConfiguration } from 'calypso/lib/store-transactions';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import CheckoutMain from 'calypso/my-sites/checkout/src/components/checkout-main';
import usePrepareProductsForCart from 'calypso/my-sites/checkout/src/hooks/use-prepare-products-for-cart';
import { useDispatch, useSelector } from 'calypso/state';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import hasLoadedSites from 'calypso/state/selectors/has-loaded-sites';
import getSite from 'calypso/state/sites/selectors/get-site';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import ClientCheckoutError from './checkout-error';
import ClientCheckoutPlaceholder from './checkout-placeholder';
import type { ShoppingCartItem } from '../types';

import './style.scss';

const debug = debugFactory( 'a4a:bd-checkout' );

/**
 * A4A-BD Checkout Component using the WordPress.com checkout
 */
function BillingDragonCheckoutContent( {
	cartItems,
	withA8cLogo = true,
	siteSlug,
	planSlug,
}: {
	cartItems: ShoppingCartItem[];
	withA8cLogo?: boolean;
	siteSlug?: string;
	planSlug?: string;
} ) {
	const translate = useTranslate();
	const [ isReady, setIsReady ] = useState( false );
	const [ error, setError ] = useState< string | null >( null );

	const dispatch = useDispatch();
	const agency = useSelector( getActiveAgency );
	const site = useSelector( ( state ) => ( siteSlug ? getSite( state, siteSlug ) : undefined ) );
	const sitesLoaded = useSelector( hasLoadedSites );
	const siteId = site?.ID;
	const isPlanCheckout = !! planSlug;

	useEffect( () => {
		if ( siteId ) {
			dispatch( setSelectedSiteId( siteId ) );
		} else if ( ! isPlanCheckout ) {
			// Clear selected site when navigating to siteless cart checkout
			// This ensures the cart system uses the 'no-site' cart key
			dispatch( setSelectedSiteId( null ) );
		}
	}, [ dispatch, siteId, isPlanCheckout ] );

	// Use site's cart key when site exists, otherwise use 'no-site' for siteless checkout
	const cartKey = siteId || 'no-site';
	const { replaceProductsInCart, responseCart } = useShoppingCart( cartKey );

	const {
		productsForCart,
		isLoading: areProductsPreparing,
		error: productsError,
	} = usePrepareProductsForCart( {
		productAliasFromUrl: planSlug,
		purchaseId: null,
		usesJetpackProducts: false,
		isPrivate: false,
		siteSlug,
		sitelessCheckoutType: 'a4a',
	} );

	debug( '[A4A Checkout] Cart items: ', cartItems );

	// Plan Checkout Flow: This flow is used when a planSlug is provided in the URL (e.g., /checkout/:siteSlug/:planSlug).
	// It handles direct plan purchases by:
	// 1. Using usePrepareProductsForCart to convert the plan slug into products
	// 2. Adding agency metadata to the products
	// 3. Replacing the cart with the prepared products
	useEffect( () => {
		if ( ! isPlanCheckout || areProductsPreparing ) {
			return;
		}

		// Check if user has access to the site when siteSlug is provided
		if ( siteSlug && sitesLoaded && ! site ) {
			debug( '[A4A Checkout] User does not have access to site:', siteSlug );
			page( A4A_MARKETPLACE_LINK );
			return;
		}

		if ( ! agency ) {
			debug( '[A4A Checkout] Agency not loaded yet, waiting (plan checkout)...' );
			return;
		}

		if ( ! productsForCart.length || productsError ) {
			debug( '[A4A Checkout] No products created from plan slug' );
			return;
		}

		const productsWithAgency = productsForCart.map( ( product ) => ( {
			...product,
			extra: {
				...product.extra,
				agency_id: agency.id,
				isA4ADevSiteCheckout: true,
			},
		} ) );

		debug( '[A4A Checkout] Replacing cart with products from plan slug', productsWithAgency );
		replaceProductsInCart( productsWithAgency )
			.then( () => {
				debug( '[A4A Checkout] Products added to cart successfully (plan slug)' );
				setIsReady( true );
			} )
			.catch( ( err ) => {
				debug( '[A4A Checkout] Failed to add products to cart:', err );
			} );
	}, [
		areProductsPreparing,
		agency,
		isPlanCheckout,
		productsError,
		productsForCart,
		replaceProductsInCart,
		site,
		siteSlug,
		sitesLoaded,
	] );

	// Cart Items Flow: This flow is used when cartItems are provided via props (the traditional A4A cart flow).
	// It handles checkout for items already in the A4A shopping cart by:
	// 1. Waiting for cartItems to be populated from the A4A cart
	// 2. Converting A4A cart items into BD cart format
	// 3. Replacing the cart with the converted products
	// This is the original flow used when users add items to their cart first, then navigate to checkout.
	useEffect( () => {
		if ( isPlanCheckout ) {
			return;
		}

		// Skip if we're already ready
		if ( isReady ) {
			debug( '[A4A Checkout] Already ready' );
			return;
		}

		// Ensure agency is loaded before proceeding
		if ( ! agency ) {
			debug( '[A4A Checkout] Agency not loaded yet, waiting...' );
			return;
		}

		// Wait for cartItems to be populated
		if ( ! cartItems || cartItems.length === 0 ) {
			debug( '[A4A Checkout] Cart items not loaded yet, waiting...' );
			// Reset error state when waiting for cart items
			if ( error ) {
				setError( null );
			}
			return;
		}

		debug( '[A4A Checkout] Cart items inside useEffect: ', cartItems );

		const productsToAdd = cartItems.flatMap( ( product ) => {
			const productQuantity = product.quantity > 0 ? product.quantity : 1;

			let cartItemIndex = 0;
			// Add each product separately instead of using volume
			// This ensures each site gets the correct tier pricing
			return Array.from( { length: productQuantity }, () => {
				const product_cart = {
					// When using the wpcom checkout we use alternative a4a-specific billing product ids for wpcom and jetpack products.
					product_id: product.alternative_product_id || product.product_id,
					product_slug: product.slug,
					extra: {
						isA4ASitelessCheckout: true,
						agency_id: agency.id,
						cart_item_index: cartItemIndex++,
					},
				};
				debug( '[A4A Checkout] Processing product to add: ', product_cart );
				return createRequestCartProduct( product_cart );
			} );
		} );

		debug( '[A4A Checkout] Products to add', productsToAdd );

		// Replace products in cart
		if ( productsToAdd.length > 0 ) {
			replaceProductsInCart( productsToAdd )
				.then( () => {
					debug( '[A4A Checkout] Products added to cart successfully' );
					debug( '[A4A Checkout] Cart', responseCart );
					setIsReady( true );
				} )
				.catch( ( err ) => {
					debug( '[A4A Checkout] Failed to add products to cart:', err );
					setError( 'Failed to add products to cart' );
				} );
		} else {
			debug( '[A4A Checkout] No matching products found to add to cart' );
			setError( 'Could not find the requested products' );
		}
	}, [ isReady, error, replaceProductsInCart, responseCart, agency, cartItems, isPlanCheckout ] );

	// Debugging: Set a timeout to force showing the checkout after 2 seconds
	// Todo: This was reduced from 10 seconds to 2 seconds to check if it works well. Better UX.
	useEffect( () => {
		if ( isReady || error ) {
			return;
		}

		const timeoutId = setTimeout( () => {
			debug( '[A4A Checkout] Timeout reached, showing checkout anyway' );
			setIsReady( true );
		}, 2000 );

		return () => clearTimeout( timeoutId );
	}, [ isReady, error ] );

	if ( ! isReady ) {
		return <ClientCheckoutPlaceholder />;
	}

	if ( error ) {
		return <ClientCheckoutError title={ translate( 'Error' ) } message={ error } />;
	}

	return (
		<div className="client-checkout-v2">
			{ withA8cLogo && (
				<div className="client-checkout-v2__top-bar">
					<div className="client-checkout-v2__top-bar-logo">
						<A4ALogo full size={ 14 } />
					</div>
				</div>
			) }
			<CheckoutMain
				sitelessCheckoutType="a4a"
				redirectTo={ window.location.origin + '/purchases/licenses' }
				customizedPreviousPath="/marketplace"
				siteSlug={ siteSlug ?? '' }
				siteId={ siteId ?? 0 }
			/>
		</div>
	);
}

export default function BillingDragonCheckout( {
	cartItems,
	withA8cLogo = true,
	siteSlug,
	planSlug,
}: {
	cartItems: ShoppingCartItem[];
	withA8cLogo?: boolean;
	siteSlug?: string;
	planSlug?: string;
} ) {
	const translate = useTranslate();
	const locale = useSelector( getCurrentUserLocale );

	return (
		<CheckoutErrorBoundary
			errorMessage={ translate( 'Sorry, there was an error loading the checkout page.' ) }
		>
			<CalypsoShoppingCartProvider shouldShowPersistentErrors>
				<StripeHookProvider fetchStripeConfiguration={ getStripeConfiguration } locale={ locale }>
					<RazorpayHookProvider fetchRazorpayConfiguration={ getRazorpayConfiguration }>
						<BillingDragonCheckoutContent
							cartItems={ cartItems }
							withA8cLogo={ withA8cLogo }
							siteSlug={ siteSlug }
							planSlug={ planSlug }
						/>
					</RazorpayHookProvider>
				</StripeHookProvider>
			</CalypsoShoppingCartProvider>
		</CheckoutErrorBoundary>
	);
}
