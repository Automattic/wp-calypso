import { RazorpayHookProvider } from '@automattic/calypso-razorpay';
import { type Callback } from '@automattic/calypso-router';
import { StripeHookProvider } from '@automattic/calypso-stripe';
import { CheckoutErrorBoundary } from '@automattic/composite-checkout';
import { createRequestCartProduct, useShoppingCart } from '@automattic/shopping-cart';
import { getQueryArg } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import SidebarPlaceholder from 'calypso/a8c-for-agencies/components/sidebar-placeholder';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { getStripeConfiguration, getRazorpayConfiguration } from 'calypso/lib/store-transactions';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import CheckoutMain from 'calypso/my-sites/checkout/src/components/checkout-main';
import { useSelector } from 'calypso/state';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import ClientSidebar from '../../components/sidebar-menu/client';
import useFetchClientReferral from '../client/hooks/use-fetch-client-referral';
import useProductsById from '../marketplace/hooks/use-products-by-id';
import { getClientReferralQueryArgs } from '../marketplace/lib/get-client-referral-query-args';
import InvoicesOverview from '../purchases/invoices/invoices-overview';
import PaymentMethodAdd from '../purchases/payment-methods/payment-method-add';
import PaymentMethodOverview from '../purchases/payment-methods/payment-method-overview';
import ClientLanding from './client-landing';
import ClientCheckout from './primary/checkout';
import SubscriptionsList from './primary/subscriptions-list';

/**
 * Client Checkout Component using the WordPress.com checkout
 */
function ClientCheckoutContent() {
	const translate = useTranslate();
	const [ isReady, setIsReady ] = useState( false );
	const [ error, setError ] = useState< string | null >( null );

	const { data: referral } = useFetchClientReferral( getClientReferralQueryArgs() );
	const { referredProducts } = useProductsById( referral?.products ?? [] );

	// Access the shopping cart API
	const { addProductsToCart, responseCart } = useShoppingCart( 'no-site' );

	// Add products to cart when referral data is loaded
	useEffect( () => {
		// Skip if we're already ready or have an error
		if ( isReady || error ) {
			console.log( '[A4A Checkout] Already ready or has error' );
			return;
		}

		if ( ! referredProducts || referredProducts.length === 0 ) {
			console.log( '[A4A Checkout] No referred products' );
			return;
		}

		console.log( '[A4A Checkout] Referral', referral );
		console.log( '[A4A Checkout] Referred products', referredProducts );

		const productsToAdd = referredProducts.map( ( product ) => {
			return createRequestCartProduct( {
				product_id: product.product_id,
				product_slug: product.slug,
				extra: { isA4ASitelessCheckout: true },
			} );
		} );

		console.log( '[A4A Checkout] Products to add', productsToAdd );

		// Add products to cart
		if ( productsToAdd.length > 0 ) {
			addProductsToCart( productsToAdd )
				.then( () => {
					console.log( '[A4A Checkout] Products added to cart successfully' );
					console.log( '[A4A Checkout] Cart', responseCart );
					setIsReady( true );
				} )
				.catch( ( err ) => {
					console.error( '[A4A Checkout] Failed to add products to cart:', err );
					setError( 'Failed to add products to cart' );
				} );
		} else {
			console.log( '[A4A Checkout] No matching products found to add to cart' );
			setError( 'Could not find the requested products' );
		}
	}, [ isReady, error, referredProducts ] );

	// Debugging: Set a timeout to force showing the checkout after 10 seconds
	useEffect( () => {
		if ( isReady || error ) {
			return;
		}

		const timeoutId = setTimeout( () => {
			console.log( '[A4A Checkout] Timeout reached, showing checkout anyway' );
			setIsReady( true );
		}, 10000 );

		return () => clearTimeout( timeoutId );
	}, [ isReady, error ] );

	// Debugging: Show loading state
	if ( ! isReady && ! error ) {
		return (
			<div className="client-checkout-v2__loading">
				<h2>{ translate( 'Loading checkout' ) }</h2>
				<p>{ translate( 'Setting up your products for purchase' ) }</p>
			</div>
		);
	}

	// Debugging: Show error state
	if ( error ) {
		return (
			<div className="client-checkout-v2__error">
				<h2>{ translate( 'Error' ) }</h2>
				<p>{ error }</p>
			</div>
		);
	}

	// Show checkout
	return (
		<div className="client-checkout-v2">
			<CheckoutMain
				sitelessCheckoutType="a4a"
				redirectTo="/client/subscriptions"
				isInModal={ false }
				siteSlug=""
				siteId={ 0 }
			/>
		</div>
	);
}

/**
 * Wrapper component that provides necessary context providers
 */
function ClientCheckoutV2() {
	const translate = useTranslate();
	const locale = useSelector( getCurrentUserLocale );

	return (
		<>
			<PageViewTracker title="Client > Checkout V2" path="/client/checkout/v2" />
			<CheckoutErrorBoundary
				errorMessage={ translate( 'Sorry, there was an error loading the checkout page.' ) }
				onError={ ( error ) => {
					console.error( 'Checkout error', error );
				} }
			>
				<CalypsoShoppingCartProvider shouldShowPersistentErrors>
					<StripeHookProvider fetchStripeConfiguration={ getStripeConfiguration } locale={ locale }>
						<RazorpayHookProvider fetchRazorpayConfiguration={ getRazorpayConfiguration }>
							<ClientCheckoutContent />
						</RazorpayHookProvider>
					</StripeHookProvider>
				</CalypsoShoppingCartProvider>
			</CheckoutErrorBoundary>
		</>
	);
}

export const clientLandingContext: Callback = ( context, next ) => {
	context.primary = <ClientLanding />;
	context.secondary = <SidebarPlaceholder />;
	next();
};

export const clientSubscriptionsContext: Callback = ( context, next ) => {
	context.primary = (
		<>
			<PageViewTracker title="Client > Subscriptions" path={ context.path } />
			<SubscriptionsList />
		</>
	);
	context.secondary = <ClientSidebar path={ context.path } />;
	next();
};

export const clientPaymentMethodsContext: Callback = ( context, next ) => {
	context.primary = (
		<>
			<PageViewTracker title="Client > Payment Methods" path={ context.path } />
			<PaymentMethodOverview />
		</>
	);
	context.secondary = <ClientSidebar path={ context.path } />;
	next();
};

export const clientPaymentMethodsAddContext: Callback = ( context, next ) => {
	const { query } = context;
	const agencyId = query && query.return && getQueryArg( query.return, 'agency_id' );
	context.primary = (
		<>
			<PageViewTracker title="Client > Payment Methods > Add" path={ context.path } />
			<PaymentMethodAdd isClientCheckout={ agencyId } />
		</>
	);

	if ( ! agencyId ) {
		context.secondary = <ClientSidebar path={ context.path } />;
	}
	next();
};

export const clientInvoicesContext: Callback = ( context, next ) => {
	context.primary = (
		<>
			<PageViewTracker title="Client > Invoices" path={ context.path } />
			<InvoicesOverview />
		</>
	);
	context.secondary = <ClientSidebar path={ context.path } />;
	next();
};

export const clientCheckoutContext: Callback = ( context, next ) => {
	context.primary = (
		<>
			<PageViewTracker title="Client > Checkout" path={ context.path } />
			<ClientCheckout />
		</>
	);
	next();
};

export const clientCheckoutV2Context: Callback = ( context, next ) => {
	context.primary = <ClientCheckoutV2 />;
	next();
};
