import { createRequestCartProduct, useShoppingCart } from '@automattic/shopping-cart';
import debugFactory from 'debug';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import usePreparedCart from 'calypso/a8c-for-agencies/sections/marketplace/billing-dragon-checkout/use-prepared-cart';
import useProductsById from 'calypso/a8c-for-agencies/sections/marketplace/hooks/use-products-by-id';
import { getClientReferralQueryArgs } from 'calypso/a8c-for-agencies/sections/marketplace/lib/get-client-referral-query-args';
import { isWPCOMHostingProduct } from 'calypso/a8c-for-agencies/sections/marketplace/lib/hosting';
import { contactDetailsActions } from 'calypso/my-sites/checkout/src/lib/checkout-stores';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import getPreparedTitanClientContext, {
	parsePositiveId,
} from '../lib/get-prepared-titan-client-context';
import useFetchClientReferral from './use-fetch-client-referral';
import type { TranslateResult } from 'i18n-calypso';

const debug = debugFactory( 'client:checkout-v2' );

type Props = {
	expressMode?: boolean;
	skipActiveCart?: boolean;
};

export default function useClientCheckout( {
	expressMode = false,
	skipActiveCart = false,
}: Props ) {
	const translate = useTranslate();
	const [ isReady, setIsReady ] = useState( false );
	const [ error, setError ] = useState< TranslateResult | null >( null );

	const queryArgs = getClientReferralQueryArgs();
	const {
		data: referral,
		isLoading: isReferralLoading,
		isError: isReferralError,
	} = useFetchClientReferral( queryArgs );
	const { referredProducts } = useProductsById(
		skipActiveCart ? [] : ( referral?.products ?? [] ),
		! skipActiveCart
	);

	// Access the shopping cart API
	const { replaceProductsInCart, responseCart } = useShoppingCart(
		expressMode ? 'no-user' : 'no-site'
	);
	const prepared = usePreparedCart( 'no-site', skipActiveCart );
	const agencyId = parsePositiveId( queryArgs.agencyId );
	const referralId = parsePositiveId( queryArgs.referralId );
	const preparedContext = skipActiveCart
		? getPreparedTitanClientContext( responseCart.products, { agencyId, referralId }, referral )
		: undefined;

	const userEmail = useSelector( ( state ) => getCurrentUser( state )?.email );

	const emailMismatchWithReferralClient = referral?.client?.email !== userEmail;
	let preparedError: TranslateResult | null = null;
	if ( skipActiveCart ) {
		if ( expressMode || ! agencyId || ! referralId || ! queryArgs.secret ) {
			preparedError = translate( 'We could not find your prepared order.' );
		} else if ( prepared.error ) {
			preparedError = prepared.error;
		} else if ( isReferralError || ( ! isReferralLoading && ! referral ) ) {
			preparedError = translate( 'Unable to load your prepared order.' );
		} else if ( prepared.isReady && referral && ! preparedContext ) {
			preparedError = translate( 'We could not find your prepared order.' );
		}
	}
	const checkoutError = preparedError ?? error;
	const isCheckoutReady = skipActiveCart
		? prepared.isReady && !! preparedContext && ! emailMismatchWithReferralClient
		: isReady;

	// Slug of the WordPress.com hosting product being purchased, if any. Used to surface a
	// confirmation notice on the subscriptions page after the client completes checkout.
	const wpcomHostingProductSlug = referredProducts?.find( ( product ) =>
		isWPCOMHostingProduct( product.slug )
	)?.slug;

	// Add products to cart when referral data is loaded
	useEffect( () => {
		if ( skipActiveCart ) {
			return;
		}
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

		// A referral repeats a product once per license. The cart merges identical
		// lines, so each repeat gets its own index.
		const repeats = new Map< number, number >();
		const productsToAdd = referredProducts.map( ( product ) => {
			// When using the wpcom checkout we use alternative a4a-specific billing product ids for wpcom and jetpack products.
			const productId = product.alternative_product_id || product.product_id;
			const cartItemIndex = repeats.get( productId ) ?? 0;
			repeats.set( productId, cartItemIndex + 1 );
			return createRequestCartProduct( {
				product_id: productId,
				product_slug: product.slug,
				extra: {
					isA4ASitelessCheckout: true,
					referral_id: queryArgs.referralId,
					agency_id: queryArgs.agencyId,
					cart_item_index: cartItemIndex,
					// The checkout shows a product's licenses as one line.
					mergeIdenticalItems: true,
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
		skipActiveCart,
	] );

	// Set referral client email in checkout store for express checkout
	useEffect( () => {
		if ( expressMode && referral?.client?.email ) {
			debug(
				'[A4A Checkout] Setting referral client email in checkout store:',
				referral.client.email
			);
			contactDetailsActions.updateEmail( referral.client.email );
		}
	}, [ expressMode, referral?.client?.email ] );

	// Debugging: Set a timeout after 30 seconds
	useEffect( () => {
		if ( isCheckoutReady || checkoutError ) {
			return;
		}

		const timeoutId = setTimeout( () => {
			debug( '[A4A Checkout] Timeout reached' );
			setError( translate( 'Unable to load shopping cart.' ) );
		}, 30000 );

		return () => clearTimeout( timeoutId );
	}, [ isCheckoutReady, checkoutError, translate ] );

	return {
		isReady: isCheckoutReady,
		error: checkoutError,
		emailMismatchWithReferralClient,
		referral,
		wpcomHostingProductSlug,
		preparedCartContext: preparedContext,
		products: responseCart.products,
	};
}
