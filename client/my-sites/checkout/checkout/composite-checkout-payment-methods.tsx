/**
 * External dependencies
 */
import React, { useReducer, useEffect } from 'react';
import debugFactory from 'debug';
import { useTranslate } from 'i18n-calypso';
import {
	createPayPalMethod,
	createStripeMethod,
	createApplePayMethod,
	createExistingCardMethod,
	createFullCreditsMethod,
} from '@automattic/composite-checkout';
import {
	prepareDomainContactDetails,
	CheckoutCartItem,
} from '@automattic/composite-checkout-wpcom';
import wp from 'lib/wp';

/**
 * Internal dependencies
 */
import {
	WPCOMTransactionEndpoint,
	WPCOMTransactionEndpointRequestPayload,
	WPCOMTransactionEndpointResponse,
	createTransactionEndpointRequestPayloadFromLineItems,
	PayPalExpressEndpoint,
	PayPalExpressEndpointRequestPayload,
	PayPalExpressEndpointResponse,
	createPayPalExpressEndpointRequestPayloadFromLineItems,
} from './types';

const debug = debugFactory( 'calypso:composite-checkout-payment-methods' );

export function createPaymentMethods( {
	isLoading,
	allowedPaymentMethods,
	storedCards,
	select,
	registerStore,
	wpcom,
	credits,
	total,
	subtotal,
	translate,
}: {
	isLoading: boolean;
	allowedPaymentMethods: Array< string >;
	storedCards: Array< object >;
	select: Function;
	registerStore: Function;
	wpcom: object;
	credits: CheckoutCartItem;
	total: CheckoutCartItem;
	subtotal: CheckoutCartItem;
	translate: Function;
} ): Array< object > {
	if ( isLoading ) {
		return [];
	}

	debug( 'creating payment methods; allowedPaymentMethods is', allowedPaymentMethods );

	const fullCreditsPaymentMethod =
		credits.amount.value > 0 && credits.amount.value >= subtotal.amount.value
			? createFullCreditsMethod( {
					registerStore,
					submitTransaction: submitData =>
						submitCreditsTransaction(
							{
								...submitData,
								siteId: select( 'wpcom' )?.getSiteId?.(),
								domainDetails: getDomainDetails( select ),
								// this data is intentionally empty so we do not charge taxes
								country: null,
								postalCode: null,
							},
							wpcomTransaction
						),
					creditsDisplayValue: credits.amount.displayValue,
					label: <WordPressCreditsLabel credits={ credits } />,
					summary: <WordPressCreditsSummary />,
					buttonText: translate( 'Pay %(amount)s with WordPress.com Credits', {
						args: { amount: total.amount.displayValue },
					} ),
			  } )
			: null;

	const stripeMethod = isMethodEnabled( 'card', allowedPaymentMethods )
		? createStripeMethod( {
				getCountry: () => select( 'wpcom' )?.getContactInfo?.()?.countryCode?.value,
				getPostalCode: () => select( 'wpcom' )?.getContactInfo?.()?.postalCode?.value,
				getSubdivisionCode: () => select( 'wpcom' )?.getContactInfo?.()?.state?.value,
				registerStore,
				fetchStripeConfiguration: args => fetchStripeConfiguration( args, wpcom ),
				submitTransaction: submitData =>
					sendStripeTransaction(
						{
							...submitData,
							siteId: select( 'wpcom' )?.getSiteId?.(),
							domainDetails: getDomainDetails( select ),
						},
						wpcomTransaction
					),
		  } )
		: null;

	const paypalMethod = isMethodEnabled( 'paypal', allowedPaymentMethods )
		? createPayPalMethod( {
				successUrl: `/checkout/thank-you/${ select( 'wpcom' )?.getSiteId?.() }/`, // TODO: get the correct redirect URL
				cancelUrl: window.location.href,
				registerStore: registerStore,
				submitTransaction: submitData =>
					makePayPalExpressRequest(
						{
							...submitData,
							siteId: select( 'wpcom' )?.getSiteId?.(),
							domainDetails: getDomainDetails( select ),
							couponId: null, // TODO: get couponId
							country: select( 'wpcom' )?.getContactInfo?.()?.countryCode?.value,
							postalCode: select( 'wpcom' )?.getContactInfo?.()?.postalCode?.value,
							subdivisionCode: select( 'wpcom' )?.getContactInfo?.()?.state?.value,
						},
						wpcomPayPalExpress
					),
		  } )
		: null;

	const applePayMethod =
		isMethodEnabled( 'apple-pay', allowedPaymentMethods ) && isApplePayAvailable()
			? createApplePayMethod( {
					getCountry: () => select( 'wpcom' )?.getContactInfo?.()?.countryCode?.value,
					getPostalCode: () => select( 'wpcom' )?.getContactInfo?.()?.postalCode?.value,
					registerStore,
					fetchStripeConfiguration: args => fetchStripeConfiguration( args, wpcom ),
					submitTransaction: submitData =>
						submitApplePayPayment(
							{
								...submitData,
								siteId: select( 'wpcom' )?.getSiteId?.(),
								domainDetails: getDomainDetails( select ),
							},
							wpcomTransaction
						),
			  } )
			: null;

	const existingCardMethods = isMethodEnabled( 'card', allowedPaymentMethods )
		? storedCards.map( storedDetails =>
				createExistingCardMethod( {
					id: `existingCard-${ storedDetails.stored_details_id }`,
					cardholderName: storedDetails.name,
					cardExpiry: storedDetails.expiry,
					brand: storedDetails.card_type,
					last4: storedDetails.card,
					submitTransaction: submitData =>
						submitExistingCardPayment(
							{
								...submitData,
								siteId: select( 'wpcom' )?.getSiteId?.(),
								storedDetailsId: storedDetails.stored_details_id,
								paymentMethodToken: storedDetails.mp_ref,
								paymentPartnerProcessorId: storedDetails.payment_partner,
								domainDetails: getDomainDetails( select ),
							},
							wpcomTransaction
						),
					registerStore,
					getCountry: () => select( 'wpcom' )?.getContactInfo?.()?.countryCode?.value,
					getPostalCode: () => select( 'wpcom' )?.getContactInfo?.()?.postalCode?.value,
					getSubdivisionCode: () => select( 'wpcom' )?.getContactInfo?.()?.state?.value,
				} )
		  )
		: [];

	return [
		fullCreditsPaymentMethod,
		...existingCardMethods,
		stripeMethod,
		paypalMethod,
		applePayMethod,
	].filter( Boolean );
}

export function useStoredCards( getStoredCards ) {
	const [ state, dispatch ] = useReducer( storedCardsReducer, {
		storedCards: [],
		isLoading: true,
	} );
	useEffect( () => {
		let isSubscribed = true;
		async function fetchStoredCards() {
			debug( 'fetching stored cards' );
			return getStoredCards();
		}

		// TODO: handle errors
		fetchStoredCards().then( cards => {
			debug( 'stored cards fetched', cards );
			isSubscribed && dispatch( { type: 'FETCH_END', payload: cards } );
		} );

		return () => ( isSubscribed = false );
	}, [ getStoredCards ] );
	return state;
}

function storedCardsReducer( state, action ) {
	switch ( action.type ) {
		case 'FETCH_END':
			return { ...state, storedCards: action.payload, isLoading: false };
		default:
			return state;
	}
}

async function submitExistingCardPayment(
	transactionData,
	submit: WPCOMTransactionEndpoint
): Promise< WPCOMTransactionEndpointResponse > {
	debug( 'formatting existing card transaction', transactionData );
	const formattedTransactionData = createTransactionEndpointRequestPayloadFromLineItems( {
		debug,
		...transactionData,
		paymentMethodType: 'WPCOM_Billing_MoneyPress_Stored',
	} );
	debug( 'submitting existing card transaction', formattedTransactionData );
	return submit( formattedTransactionData );
}

async function submitApplePayPayment(
	transactionData,
	submit: WPCOMTransactionEndpoint
): Promise< WPCOMTransactionEndpointResponse > {
	debug( 'formatting apple-pay transaction', transactionData );
	const formattedTransactionData = createTransactionEndpointRequestPayloadFromLineItems( {
		debug,
		...transactionData,
		paymentMethodType: 'WPCOM_Billing_Stripe_Payment_Method',
		paymentPartnerProcessorId: transactionData.stripeConfiguration.processor_id,
	} );
	debug( 'submitting apple-pay transaction', formattedTransactionData );
	return submit( formattedTransactionData );
}

async function makePayPalExpressRequest(
	transactionData,
	submit: PayPalExpressEndpoint
): Promise< WPCOMTransactionEndpointResponse > {
	const formattedTransactionData = createPayPalExpressEndpointRequestPayloadFromLineItems( {
		debug,
		...transactionData,
	} );
	debug( 'sending paypal transaction', formattedTransactionData );
	return submit( formattedTransactionData );
}

function getDomainDetails( select ) {
	const managedContactDetails = select( 'wpcom' )?.getContactInfo?.() ?? {};
	return prepareDomainContactDetails( managedContactDetails );
}

function isApplePayAvailable(): boolean {
	// Our Apple Pay implementation uses the Payment Request API, so check that first.
	if ( ! window.PaymentRequest ) {
		return false;
	}

	// Check if Apple Pay is available. This can be very expensive on certain
	// Safari versions due to a bug (https://trac.webkit.org/changeset/243447/webkit),
	// and there is no way it can change during a page request, so cache the
	// result.
	if ( typeof isApplePayAvailable.canMakePayments === 'undefined' ) {
		try {
			isApplePayAvailable.canMakePayments = Boolean(
				window.ApplePaySession && window.ApplePaySession.canMakePayments()
			);
		} catch ( error ) {
			console.error( error ); // eslint-disable-line no-console
			return false;
		}
	}
	return isApplePayAvailable.canMakePayments;
}

async function fetchStripeConfiguration( requestArgs, wpcom ) {
	return wpcom.stripeConfiguration( requestArgs );
}

async function sendStripeTransaction(
	transactionData,
	submit: WPCOMTransactionEndpoint
): Promise< WPCOMTransactionEndpointResponse > {
	const formattedTransactionData = createTransactionEndpointRequestPayloadFromLineItems( {
		debug,
		...transactionData,
		paymentMethodToken: transactionData.paymentMethodToken.id,
		paymentMethodType: 'WPCOM_Billing_Stripe_Payment_Method',
		paymentPartnerProcessorId: transactionData.stripeConfiguration.processor_id,
	} );
	debug( 'sending stripe transaction', formattedTransactionData );
	return submit( formattedTransactionData );
}

function submitCreditsTransaction(
	transactionData,
	submit: WPCOMTransactionEndpoint
): Promise< WPCOMTransactionEndpointResponse > {
	debug( 'formatting full credits transaction', transactionData );
	const formattedTransactionData = createTransactionEndpointRequestPayloadFromLineItems( {
		debug,
		...transactionData,
		paymentMethodType: 'WPCOM_Billing_WPCOM',
	} );
	debug( 'submitting full credits transaction', formattedTransactionData );
	return submit( formattedTransactionData );
}

function isMethodEnabled( method: string, allowedPaymentMethods: string[] ): boolean {
	// By default, allow all payment methods
	if ( ! allowedPaymentMethods?.length ) {
		return true;
	}
	return allowedPaymentMethods.includes( method );
}

function WordPressCreditsLabel( { credits } ) {
	const translate = useTranslate();

	return (
		<React.Fragment>
			<div>
				{ translate( 'WordPress.com Credits: %(amount)s', {
					args: { amount: credits.amount.displayValue },
				} ) }
			</div>
			<WordPressLogo />
		</React.Fragment>
	);
}

function WordPressCreditsSummary() {
	const translate = useTranslate();
	return <div>{ translate( 'WordPress.com Credits' ) }</div>;
}

function WordPressLogo() {
	return (
		<svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path
				d="M10.2598 0.461304C4.74757 0.461304 0.259766 4.94911 0.259766 10.4613C0.259766 15.9735 4.74757 20.4613 10.2598 20.4613C15.772 20.4613 20.2598 15.9735 20.2598 10.4613C20.2598 4.94911 15.772 0.461304 10.2598 0.461304ZM1.27196 10.4613C1.27196 9.15643 1.55245 7.92472 2.05245 6.80277L6.33294 18.5467C3.33294 17.0955 1.27196 14.0223 1.27196 10.4613ZM10.2598 19.4491C9.38172 19.4491 8.52806 19.315 7.72318 19.0833L10.4183 11.2418L13.1866 18.815C13.1988 18.8637 13.2232 18.9003 13.2476 18.9369C12.3085 19.2662 11.3085 19.4491 10.2598 19.4491ZM11.4915 6.24179C12.0281 6.2174 12.5159 6.15643 12.5159 6.15643C13.0037 6.09545 12.9427 5.38813 12.4549 5.41252C12.4549 5.41252 11.0037 5.52228 10.0524 5.52228C9.1744 5.52228 7.6866 5.41252 7.6866 5.41252C7.19879 5.38813 7.15001 6.11984 7.62562 6.15643C7.62562 6.15643 8.08903 6.2174 8.56464 6.24179L9.96708 10.0833L8.02806 15.9857L4.74757 6.24179C5.28416 6.2174 5.77196 6.15643 5.77196 6.15643C6.25977 6.09545 6.19879 5.38813 5.71099 5.41252C5.71099 5.41252 4.25977 5.52228 3.32074 5.52228C3.15001 5.52228 2.95489 5.52228 2.74757 5.51008C4.35733 3.07106 7.11342 1.4613 10.2598 1.4613C12.6012 1.4613 14.7354 2.35155 16.3329 3.82716C16.2964 3.82716 16.2598 3.81496 16.211 3.81496C15.3329 3.81496 14.6988 4.58326 14.6988 5.41252C14.6988 6.15643 15.1256 6.77838 15.5768 7.52228C15.9183 8.11984 16.3207 8.88813 16.3207 9.99789C16.3207 10.7662 16.089 11.7418 15.6378 12.9003L14.7354 15.9003L11.4915 6.24179ZM14.772 18.2296L17.5159 10.2906C18.0281 9.01009 18.1988 7.98569 18.1988 7.07106C18.1988 6.74179 18.1744 6.43691 18.1378 6.14423C18.8451 7.42472 19.2354 8.88813 19.2354 10.4613C19.2476 13.7784 17.4549 16.6686 14.772 18.2296Z"
				fill="#006088"
			/>
		</svg>
	);
}

async function wpcomTransaction(
	payload: WPCOMTransactionEndpointRequestPayload
): Promise< WPCOMTransactionEndpointResponse > {
	return wp.undocumented().transactions( payload );
}

async function wpcomPayPalExpress(
	payload: PayPalExpressEndpointRequestPayload
): Promise< PayPalExpressEndpointResponse > {
	return wp.undocumented().paypalExpressUrl( payload );
}
