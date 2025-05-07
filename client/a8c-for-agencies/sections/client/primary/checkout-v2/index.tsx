import { RazorpayHookProvider } from '@automattic/calypso-razorpay';
import { StripeHookProvider } from '@automattic/calypso-stripe';
import { CheckoutErrorBoundary } from '@automattic/composite-checkout';
import { createRequestCartProduct, useShoppingCart } from '@automattic/shopping-cart';
import debugFactory from 'debug';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import useProductsById from 'calypso/a8c-for-agencies/sections/marketplace/hooks/use-products-by-id';
import { getClientReferralQueryArgs } from 'calypso/a8c-for-agencies/sections/marketplace/lib/get-client-referral-query-args';
import { getStripeConfiguration, getRazorpayConfiguration } from 'calypso/lib/store-transactions';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import CheckoutMain from 'calypso/my-sites/checkout/src/components/checkout-main';
import { useSelector } from 'calypso/state';
import { getCurrentUser, getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import ClientCheckoutV2Error from '../../checkout-v2-error';
import ClientCheckoutV2Placeholder from '../../checkout-v2-placeholder';
import useFetchClientReferral from '../../hooks/use-fetch-client-referral';

import './style.scss';

const debug = debugFactory( 'client:checkout-v2' );

/**
 * Client Checkout Component using the WordPress.com checkout
 */
function ClientCheckoutContent() {
	const translate = useTranslate();
	const [ isReady, setIsReady ] = useState( false );
	const [ error, setError ] = useState< string | null >( null );

	const queryArgs = getClientReferralQueryArgs();
	const { data: referral } = useFetchClientReferral( queryArgs );
	const { referredProducts } = useProductsById( referral?.products ?? [] );

	// Access the shopping cart API
	const { replaceProductsInCart, responseCart } = useShoppingCart( 'no-site' );

	const userEmail = useSelector( ( state ) => getCurrentUser( state )?.email );

	const emailMismatchWithReferralClient = referral?.client?.email !== userEmail;

	// Add products to cart when referral data is loaded
	useEffect( () => {
		// Skip if we're already ready or have an error
		if ( isReady || error ) {
			debug( '[A4A Checkout] Already ready or has error' );
			return;
		}

		if ( ! referredProducts || referredProducts.length === 0 ) {
			debug( '[A4A Checkout] No referred products' );
			return;
		}

		debug( '[A4A Checkout] Referral', referral );
		debug( '[A4A Checkout] Referred products', referredProducts );

		const productsToAdd = referredProducts.map( ( product ) => {
			return createRequestCartProduct( {
				// When using the wpcom checkout we use alternative a4a-specific billing product ids for wpcom and jetpack products.
				product_id: product.alternative_product_id || product.product_id,
				product_slug: product.slug,
				extra: {
					isA4ASitelessCheckout: true,
					referral_id: queryArgs.referralId,
					agency_id: queryArgs.agencyId,
				},
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
	}, [
		isReady,
		error,
		referredProducts,
		referral,
		replaceProductsInCart,
		responseCart,
		queryArgs.referralId,
		queryArgs.agencyId,
	] );

	// Debugging: Set a timeout to force showing the checkout after 10 seconds
	useEffect( () => {
		if ( isReady || error ) {
			return;
		}

		const timeoutId = setTimeout( () => {
			debug( '[A4A Checkout] Timeout reached, showing checkout anyway' );
			setIsReady( true );
		}, 10000 );

		return () => clearTimeout( timeoutId );
	}, [ isReady, error ] );

	if ( ! isReady ) {
		return <ClientCheckoutV2Placeholder />;
	}

	if ( emailMismatchWithReferralClient ) {
		return (
			<ClientCheckoutV2Error
				title={ translate( 'Permission denied' ) }
				message={ translate(
					'This referral is not intended for your account. Please make sure you sign in using {{b}}%(referralEmail)s{{/b}}.',
					{
						args: {
							referralEmail: referral?.client?.email,
						},
						components: {
							b: <b />,
						},
						comment: '%(referralEmail)s is the email of the referral client.',
					}
				) }
			/>
		);
	}

	if ( error ) {
		return <ClientCheckoutV2Error title={ translate( 'Error' ) } message={ error } />;
	}

	return (
		<div className="client-checkout-v2">
			<CheckoutMain
				sitelessCheckoutType="a4a"
				redirectTo={ window.location.origin + '/client/subscriptions' }
				customizedPreviousPath="/client/subscriptions"
				isInModal={ false }
				siteSlug=""
				siteId={ 0 }
			/>
		</div>
	);
}

export default function ClientCheckoutV2() {
	const translate = useTranslate();
	const locale = useSelector( getCurrentUserLocale );

	return (
		<CheckoutErrorBoundary
			errorMessage={ translate( 'Sorry, there was an error loading the checkout page.' ) }
		>
			<CalypsoShoppingCartProvider shouldShowPersistentErrors>
				<StripeHookProvider fetchStripeConfiguration={ getStripeConfiguration } locale={ locale }>
					<RazorpayHookProvider fetchRazorpayConfiguration={ getRazorpayConfiguration }>
						<ClientCheckoutContent />
					</RazorpayHookProvider>
				</StripeHookProvider>
			</CalypsoShoppingCartProvider>
		</CheckoutErrorBoundary>
	);
}
