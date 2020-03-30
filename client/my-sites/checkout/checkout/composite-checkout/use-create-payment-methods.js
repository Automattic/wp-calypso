/**
 * External dependencies
 */
import { useMemo } from 'react';
import {
	createPayPalMethod,
	createStripePaymentMethodStore,
	createStripeMethod,
	registerStore,
	defaultRegistry,
} from '@automattic/composite-checkout';
import { format as formatUrl, parse as parseUrl } from 'url';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import {
	makePayPalExpressRequest,
	wpcomPayPalExpress,
	getDomainDetails,
	sendStripeTransaction,
	wpcomTransaction,
} from '../composite-checkout-payment-methods';

const debug = debugFactory( 'calypso:composite-checkout:use-create-payment-methods' );
const { select, dispatch } = defaultRegistry;

export function useCreatePayPal( { onlyLoadPaymentMethods, getThankYouUrl, getItems } ) {
	const shouldLoadPayPalMethod = onlyLoadPaymentMethods
		? onlyLoadPaymentMethods.includes( 'paypal' )
		: true;
	const paypalMethod = useMemo( () => {
		if ( ! shouldLoadPayPalMethod ) {
			return null;
		}
		return createPayPalMethod( { registerStore } );
	}, [ shouldLoadPayPalMethod ] );
	if ( paypalMethod ) {
		paypalMethod.id = 'paypal';
		// This is defined afterward so that getThankYouUrl can be dynamic without having to re-create payment method
		paypalMethod.submitTransaction = () => {
			const { protocol, hostname, port, pathname } = parseUrl( window.location.href, true );
			const successUrl = formatUrl( {
				protocol,
				hostname,
				port,
				pathname: getThankYouUrl(),
			} );
			const cancelUrl = formatUrl( {
				protocol,
				hostname,
				port,
				pathname,
			} );

			return makePayPalExpressRequest(
				{
					items: getItems(),
					successUrl,
					cancelUrl,
					siteId: select( 'wpcom' )?.getSiteId?.() ?? '',
					domainDetails: getDomainDetails( select ),
					couponId: null, // TODO: get couponId
					country: select( 'wpcom' )?.getContactInfo?.()?.countryCode?.value ?? '',
					postalCode: select( 'wpcom' )?.getContactInfo?.()?.postalCode?.value ?? '',
					subdivisionCode: select( 'wpcom' )?.getContactInfo?.()?.state?.value ?? '',
				},
				wpcomPayPalExpress
			);
		};
	}
	return paypalMethod;
}

export function useCreateStripe( {
	onlyLoadPaymentMethods,
	isStripeLoading,
	stripeLoadingError,
	stripeConfiguration,
	stripe,
} ) {
	// If this PM is allowed by props, allowed by the cart, stripe is not loading, and there is no stripe error, then create the PM.
	const isStripeMethodAllowed = onlyLoadPaymentMethods
		? onlyLoadPaymentMethods.includes( 'card' )
		: true;
	const shouldLoadStripeMethod = isStripeMethodAllowed && ! isStripeLoading && ! stripeLoadingError;
	const stripePaymentMethodStore = useMemo(
		() =>
			createStripePaymentMethodStore( {
				getCountry: () => select( 'wpcom' )?.getContactInfo?.()?.countryCode?.value,
				getPostalCode: () => select( 'wpcom' )?.getContactInfo?.()?.postalCode?.value,
				getSubdivisionCode: () => select( 'wpcom' )?.getContactInfo?.()?.state?.value,
				getSiteId: () => select( 'wpcom' )?.getSiteId?.(),
				getDomainDetails: () => getDomainDetails( select ),
				submitTransaction: submitData => {
					const pending = sendStripeTransaction( submitData, wpcomTransaction );
					// save result so we can get receipt_id and failed_purchases in getThankYouPageUrl
					pending.then( result => {
						debug( 'saving transaction response', result );
						dispatch( 'wpcom' ).setTransactionResponse( result );
					} );
					return pending;
				},
			} ),
		[]
	);
	const stripeMethod = useMemo(
		() =>
			shouldLoadStripeMethod
				? createStripeMethod( {
						store: stripePaymentMethodStore,
						stripe,
						stripeConfiguration,
				  } )
				: null,
		[ shouldLoadStripeMethod, stripePaymentMethodStore, stripe, stripeConfiguration ]
	);
	if ( stripeMethod ) {
		stripeMethod.id = 'card';
	}
	return stripeMethod;
}
