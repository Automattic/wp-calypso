import { RazorpayHookProvider } from '@automattic/calypso-razorpay';
import { StripeHookProvider } from '@automattic/calypso-stripe';
import { CheckoutErrorBoundary } from '@automattic/composite-checkout';
import { createRequestCartProduct, useShoppingCart } from '@automattic/shopping-cart';
import debugFactory from 'debug';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import A4ALogo from 'calypso/a8c-for-agencies/components/a4a-logo';
import { getStripeConfiguration, getRazorpayConfiguration } from 'calypso/lib/store-transactions';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import CheckoutMain from 'calypso/my-sites/checkout/src/components/checkout-main';
import { useSelector } from 'calypso/state';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
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
}: {
	cartItems: ShoppingCartItem[];
	withA8cLogo?: boolean;
} ) {
	const translate = useTranslate();
	const [ isReady, setIsReady ] = useState( false );
	const [ error, setError ] = useState< string | null >( null );

	// Access the shopping cart API
	const { replaceProductsInCart, responseCart } = useShoppingCart( 'no-site' );

	const agency = useSelector( getActiveAgency );

	debug( '[A4A Checkout] Cart items: ', cartItems );

	// Add products to cart when data is loaded
	// Note: We are loading products from A4A cart to the Billing Dragon cart
	useEffect( () => {
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

		const productsToAdd = cartItems.map( ( product ) => {
			const product_cart = {
				// When using the wpcom checkout we use alternative a4a-specific billing product ids for wpcom and jetpack products.
				product_id: product.alternative_product_id || product.product_id,
				product_slug: product.slug,
				extra: {
					isA4ASitelessCheckout: true,
					agency_id: agency.id,
				},
			};
			debug( '[A4A Checkout] Processing product to add: ', product_cart );
			return createRequestCartProduct( product_cart );
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
	}, [ isReady, error, replaceProductsInCart, responseCart, agency, cartItems ] );

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
				siteSlug=""
				siteId={ 0 }
			/>
		</div>
	);
}

export default function BillingDragonCheckout( {
	cartItems,
	withA8cLogo = true,
}: {
	cartItems: ShoppingCartItem[];
	withA8cLogo?: boolean;
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
						<BillingDragonCheckoutContent cartItems={ cartItems } withA8cLogo={ withA8cLogo } />
					</RazorpayHookProvider>
				</StripeHookProvider>
			</CalypsoShoppingCartProvider>
		</CheckoutErrorBoundary>
	);
}
