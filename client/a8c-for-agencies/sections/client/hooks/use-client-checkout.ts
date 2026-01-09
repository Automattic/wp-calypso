import { createRequestCartProduct, useShoppingCart } from '@automattic/shopping-cart';
import { useDispatch } from '@wordpress/data';
import debugFactory from 'debug';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import useProductsById from 'calypso/a8c-for-agencies/sections/marketplace/hooks/use-products-by-id';
import { getClientReferralQueryArgs } from 'calypso/a8c-for-agencies/sections/marketplace/lib/get-client-referral-query-args';
import { CHECKOUT_STORE } from 'calypso/my-sites/checkout/src/lib/wpcom-store';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import useFetchClientReferral from './use-fetch-client-referral';

const debug = debugFactory( 'client:checkout-v2' );

type Props = {
	expressMode?: boolean;
};

export default function useClientCheckout( { expressMode = false }: Props ) {
	const translate = useTranslate();
	const [ isReady, setIsReady ] = useState( false );
	const [ error, setError ] = useState< string | null >( null );

	const queryArgs = getClientReferralQueryArgs();
	const { data: referral } = useFetchClientReferral( queryArgs );
	const { referredProducts } = useProductsById( referral?.products ?? [] );

	// Access the shopping cart API
	const { replaceProductsInCart, responseCart } = useShoppingCart(
		expressMode ? 'no-user' : 'no-site'
	);

	const userEmail = useSelector( ( state ) => getCurrentUser( state )?.email );

	// Access checkout store to set email for express checkout
	const checkoutStoreDispatch = useDispatch( CHECKOUT_STORE );

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

	// Set referral client email in checkout store for express checkout
	useEffect( () => {
		if ( expressMode && referral?.client?.email && checkoutStoreDispatch ) {
			debug(
				'[A4A Checkout] Setting referral client email in checkout store:',
				referral.client.email
			);
			checkoutStoreDispatch.updateEmail( referral.client.email );
		}
	}, [ expressMode, referral?.client?.email, checkoutStoreDispatch ] );

	// Debugging: Set a timeout after 30 seconds
	useEffect( () => {
		if ( isReady || error ) {
			return;
		}

		const timeoutId = setTimeout( () => {
			debug( '[A4A Checkout] Timeout reached' );
			setError( translate( 'Unable to load shopping cart.' ) );
		}, 30000 );

		return () => clearTimeout( timeoutId );
	}, [ isReady, error, translate ] );

	return {
		isReady,
		error,
		emailMismatchWithReferralClient,
		referral,
	};
}
