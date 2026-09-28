import page from '@automattic/calypso-router';
import { StripeHookProvider } from '@automattic/calypso-stripe';
import { CheckoutErrorBoundary } from '@automattic/composite-checkout';
import { createRequestCartProduct, useShoppingCart } from '@automattic/shopping-cart';
import debugFactory from 'debug';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import A4ALogo from 'calypso/a8c-for-agencies/components/a4a-logo';
import { A4A_MARKETPLACE_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { getStripeConfiguration } from 'calypso/lib/store-transactions';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import CheckoutMain from 'calypso/my-sites/checkout/src/components/checkout-main';
import usePrepareProductsForCart from 'calypso/my-sites/checkout/src/hooks/use-prepare-products-for-cart';
import { useDispatch, useSelector } from 'calypso/state';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import hasLoadedSites from 'calypso/state/selectors/has-loaded-sites';
import getSite from 'calypso/state/sites/selectors/get-site';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import CartMessageCleanup from './cart-message-cleanup';
import ClientCheckoutError from './checkout-error';
import ClientCheckoutPlaceholder from './checkout-placeholder';
import getPurchasedWPCOMPlanSlug from './lib/get-purchased-wpcom-plan-slug';
import getSuccessRedirectUrl from './lib/get-success-redirect-url';
import { validatePreparedCart } from './lib/validate-prepared-cart';
import type { ShoppingCartItem } from '../types';
import type { PreparedCheckoutProduct } from 'calypso/a8c-for-agencies/data/marketplace/use-prepare-checkout';

import './style.scss';

const debug = debugFactory( 'a4a:bd-checkout' );

export interface PreparedCartProps {
	/** Products the prepare endpoint said it saved; absent on a reload of skip_active_cart=1. */
	products?: PreparedCheckoutProduct[];
	/** The `prepare` source id (or 'reload'), for tracks. */
	source: string;
}

interface BillingDragonCheckoutProps {
	cartItems: ShoppingCartItem[];
	withA8cLogo?: boolean;
	siteSlug?: string;
	planSlug?: string;
	shouldClearCartOnSuccess?: boolean;
	/**
	 * Prepared mode: a wpcom endpoint already saved the `no-site` cart. Load it
	 * as is, never replace it with Marketplace selections, and error if it is
	 * empty or not what was prepared.
	 */
	preparedCart?: PreparedCartProps;
}

/**
 * A4A-BD Checkout Component using the WordPress.com checkout
 */
function BillingDragonCheckoutContent( {
	cartItems,
	withA8cLogo = true,
	siteSlug,
	planSlug,
	shouldClearCartOnSuccess = false,
	preparedCart,
}: BillingDragonCheckoutProps ) {
	const translate = useTranslate();
	const [ isReady, setIsReady ] = useState( false );
	const [ error, setError ] = useState< string | null >( null );
	const isPreparedMode = !! preparedCart;

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
	const { replaceProductsInCart, responseCart, isLoading, isPendingUpdate } =
		useShoppingCart( cartKey );

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
		if ( isPreparedMode || ! isPlanCheckout || areProductsPreparing ) {
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
		isPreparedMode,
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
		if ( isPreparedMode || isPlanCheckout ) {
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
						...( product.site_domain ? { a4a_pressable_site_domain: product.site_domain } : {} ),
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
	}, [
		isReady,
		error,
		replaceProductsInCart,
		responseCart,
		agency,
		cartItems,
		isPlanCheckout,
		isPreparedMode,
	] );

	// Debugging: Set a timeout to force showing the checkout after 2 seconds
	// Todo: This was reduced from 10 seconds to 2 seconds to check if it works well. Better UX.
	useEffect( () => {
		if ( isReady || error || isPreparedMode ) {
			return;
		}

		const timeoutId = setTimeout( () => {
			debug( '[A4A Checkout] Timeout reached, showing checkout anyway' );
			setIsReady( true );
		}, 2000 );

		return () => clearTimeout( timeoutId );
	}, [ isReady, error, isPreparedMode ] );

	// Prepared mode: the server cart is the source of truth. Wait for it to load,
	// then require it to be the cart the prepare endpoint saved.
	useEffect( () => {
		if ( ! isPreparedMode || isReady || error || isLoading || isPendingUpdate ) {
			return;
		}

		const problem = validatePreparedCart( responseCart, preparedCart?.products );
		if ( problem ) {
			debug( '[A4A Checkout] Prepared cart invalid:', problem, responseCart );
			dispatch(
				recordTracksEvent( 'calypso_a4a_marketplace_prepared_checkout_cart_invalid', {
					source: preparedCart?.source,
					problem,
				} )
			);
			setError(
				translate( 'Please go back to where you started this purchase and try again.' ) as string
			);
			return;
		}

		debug( '[A4A Checkout] Prepared cart accepted', responseCart );
		setIsReady( true );
	}, [
		isPreparedMode,
		isReady,
		error,
		isLoading,
		isPendingUpdate,
		responseCart,
		preparedCart,
		dispatch,
		translate,
	] );

	if ( error ) {
		return (
			<ClientCheckoutError
				title={
					isPreparedMode
						? translate( 'This checkout is no longer available.' )
						: translate( 'Error' )
				}
				message={ error }
			/>
		);
	}

	if ( ! isReady ) {
		return <ClientCheckoutPlaceholder />;
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
				redirectTo={ getSuccessRedirectUrl(
					window.location.origin,
					! isPreparedMode && shouldClearCartOnSuccess && ! isPlanCheckout,
					isPlanCheckout || isPreparedMode ? null : getPurchasedWPCOMPlanSlug( cartItems )
				) }
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
	shouldClearCartOnSuccess = false,
	preparedCart,
}: BillingDragonCheckoutProps ) {
	const translate = useTranslate();
	const locale = useSelector( getCurrentUserLocale );

	return (
		<CheckoutErrorBoundary
			errorMessage={ translate( 'Sorry, there was an error loading the checkout page.' ) }
		>
			<CalypsoShoppingCartProvider shouldShowPersistentErrors>
				<CartMessageCleanup />
				<StripeHookProvider fetchStripeConfiguration={ getStripeConfiguration } locale={ locale }>
					<BillingDragonCheckoutContent
						cartItems={ cartItems }
						withA8cLogo={ withA8cLogo }
						siteSlug={ siteSlug }
						planSlug={ planSlug }
						shouldClearCartOnSuccess={ shouldClearCartOnSuccess }
						preparedCart={ preparedCart }
					/>
				</StripeHookProvider>
			</CalypsoShoppingCartProvider>
		</CheckoutErrorBoundary>
	);
}
