/**
 * External dependencies
 */
import { useMemo, useState, useEffect } from 'react';
import debugFactory from 'debug';
import {
	createPayPalMethod,
	createStripeMethod,
	createApplePayMethod,
	createExistingCardMethod,
	createFullCreditsMethod,
} from '@automattic/composite-checkout';

const debug = debugFactory( 'calypso:composite-checkout-payment-methods' );

const mockwpcom = {
	getStoredCards: () => [],
};

export function useCreatePaymentMethods( {
	allowedPaymentMethods,
	select,
	registerStore,
	wpcom,
	credits,
	total,
} ) {
	debug(
		'creating payment methods; allowedPaymentMethods is',
		allowedPaymentMethods,
		'credits is',
		credits.amount.value,
		'and total is',
		total.amount.value
	);
	const fullCreditsPaymentMethod = useMemo(
		() =>
			isMethodEnabled( 'full-credits', allowedPaymentMethods ) &&
			credits.amount.value >= total.amount.value
				? createFullCreditsMethod( {
						registerStore,
						submitTransaction: submitCreditsTransaction,
						creditsDisplayValue: credits.amount.displayValue,
				  } )
				: null,
		[ credits, total.amount, registerStore, allowedPaymentMethods ]
	);

	const stripeMethod = useMemo(
		() =>
			isMethodEnabled( 'stripe', allowedPaymentMethods )
				? createStripeMethod( {
						getCountry: () => select( 'wpcom' )?.getContactInfo?.()?.country?.value,
						getPostalCode: () => select( 'wpcom' )?.getContactInfo?.()?.postalCode?.value,
						getPhoneNumber: () => select( 'wpcom' )?.getContactInfo?.()?.phoneNumber?.value,
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
								wpcom
							),
				  } )
				: null,
		[ registerStore, select, wpcom, allowedPaymentMethods ]
	);

	const paypalMethod = useMemo(
		() =>
			isMethodEnabled( 'paypal', allowedPaymentMethods )
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
									country: select( 'wpcom' )?.getContactInfo?.()?.country?.value,
									postalCode: select( 'wpcom' )?.getContactInfo?.()?.postalCode?.value,
									subdivisionCode: select( 'wpcom' )?.getContactInfo?.()?.state?.value,
									phoneNumber: select( 'wpcom' )?.getContactInfo?.()?.phoneNumber?.value,
								},
								wpcom
							),
				  } )
				: null,
		[ registerStore, select, wpcom, allowedPaymentMethods ]
	);

	const applePayMethod = useMemo(
		() =>
			isMethodEnabled( 'apple-pay', allowedPaymentMethods ) && isApplePayAvailable()
				? createApplePayMethod( {
						registerStore,
						fetchStripeConfiguration: args => fetchStripeConfiguration( args, wpcom ),
				  } )
				: null,
		[ registerStore, wpcom, allowedPaymentMethods ]
	);

	// We have to use a mocked wpcom here since we can't not call the hook
	const storedCards = useStoredCards(
		isMethodEnabled( 'existing-cards', allowedPaymentMethods ) ? wpcom : mockwpcom
	);
	const existingCardMethods = useMemo(
		() =>
			storedCards.map( storedDetails =>
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
							wpcom
						),
					registerStore,
					getCountry: () => select( 'wpcom' )?.getContactInfo?.()?.country?.value,
					getPostalCode: () => select( 'wpcom' )?.getContactInfo?.()?.postalCode?.value,
					getPhoneNumber: () => select( 'wpcom' )?.getContactInfo?.()?.phoneNumber?.value,
					getSubdivisionCode: () => select( 'wpcom' )?.getContactInfo?.()?.state?.value,
				} )
			),
		[ storedCards, registerStore, select, wpcom ]
	);

	return useMemo(
		() =>
			[
				fullCreditsPaymentMethod,
				...existingCardMethods,
				stripeMethod,
				paypalMethod,
				applePayMethod,
			].filter( Boolean ),
		[ fullCreditsPaymentMethod, existingCardMethods, stripeMethod, paypalMethod, applePayMethod ]
	);
}

function useStoredCards( wpcom ) {
	const [ storedCards, setStoredCards ] = useState( [] );
	useEffect( () => {
		let isSubscribed = true;
		async function fetchStoredCards() {
			debug( 'fetching stored cards' );
			return wpcom.getStoredCards();
		}

		// TODO: handle errors
		fetchStoredCards().then( cards => {
			debug( 'stored cards fetched', cards );
			isSubscribed && setStoredCards( cards );
		} );

		return () => ( isSubscribed = false );
	}, [ wpcom ] );
	return storedCards;
}

async function submitExistingCardPayment( transactionData, wpcom ) {
	debug( 'formatting existing card transaction', transactionData );
	const formattedTransactionData = formatDataForTransactionsEndpoint( {
		...transactionData,
		paymentMethodType: 'WPCOM_Billing_MoneyPress_Stored',
	} );
	debug( 'submitting existing card transaction', formattedTransactionData );
	return wpcom.transactions( formattedTransactionData );
}

async function makePayPalExpressRequest( transactionData, wpcom ) {
	const formattedTransactionData = formatDataForPayPalExpressEndpoint( transactionData );
	debug( 'sending paypal transaction', formattedTransactionData );
	return wpcom.paypalExpressUrl( formattedTransactionData );
}

function getDomainDetails( select ) {
	const { firstName, lastName, email, phoneNumber, address, city, state, country, postalCode } =
		select( 'wpcom' )?.getContactInfo?.() ?? {};
	return {
		firstName: firstName?.value,
		lastName: lastName?.value,
		email: email?.value,
		phone: phoneNumber?.value,
		address_1: address?.value,
		city: city?.value,
		state: state?.value,
		countryCode: country?.value,
		postalCode: postalCode?.value,
	};
}

function isApplePayAvailable() {
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

async function sendStripeTransaction( transactionData, wpcom ) {
	const formattedTransactionData = formatDataForTransactionsEndpoint( {
		...transactionData,
		paymentMethodToken: transactionData.paymentMethodToken.id,
		paymentMethodType: 'WPCOM_Billing_Stripe_Payment_Method',
		paymentPartnerProcessorId: transactionData.stripeConfiguration.processor_id,
	} );
	debug( 'sending stripe transaction', formattedTransactionData );
	return wpcom.transactions( formattedTransactionData );
}

function formatDataForTransactionsEndpoint( {
	siteId,
	couponId, // TODO: get this
	country,
	postalCode,
	subdivisionCode,
	domainDetails,
	paymentMethodToken,
	name,
	items,
	total,
	paymentMethodType,
	paymentPartnerProcessorId,
	storedDetailsId,
} ) {
	const payment = {
		paymentMethod: paymentMethodType,
		paymentKey: paymentMethodToken,
		paymentPartner: paymentPartnerProcessorId,
		storedDetailsId,
		name,
		zip: postalCode, // TODO: do we need this in addition to postalCode?
		postalCode,
		country,
	};
	return {
		cart: createCartFromLineItems( {
			siteId,
			couponId,
			items: items.filter( item => item.type !== 'tax' ),
			total,
			country,
			postalCode,
			subdivisionCode,
		} ),
		domainDetails,
		payment,
	};
}

function formatDataForPayPalExpressEndpoint( {
	successUrl,
	cancelUrl,
	siteId,
	country,
	postalCode,
	subdivisionCode,
	phoneNumber,
	couponId,
	items,
	domainDetails,
} ) {
	return {
		successUrl,
		cancelUrl,
		cart: createCartFromLineItems( {
			siteId,
			country,
			postalCode,
			subdivisionCode,
			phoneNumber,
			couponId,
			items: items.filter( item => item.type !== 'tax' ),
		} ),
		domainDetails,
		country,
		postalCode,
	};
}

// Create cart object as required by the WPCOM transactions endpoint '/me/transactions/': WPCOM_JSON_API_Transactions_Endpoint
function createCartFromLineItems( {
	siteId,
	couponId,
	items,
	country,
	postalCode,
	subdivisionCode,
} ) {
	const currency = items.reduce( ( firstValue, item ) => firstValue || item.amount.currency, null );
	debug( 'creating cart from items', items );
	return {
		blog_id: siteId,
		coupon: couponId || '',
		currency: currency || '',
		temporary: false,
		extra: [],
		products: items.map( item => ( {
			product_id: item.wpcom_meta?.product_id,
			meta: item.sublabel,
			currency: item.amount.currency,
			volume: 1, // TODO: get this from the item
		} ) ),
		tax: {
			location: {
				country_code: country,
				postal_code: postalCode,
				subdivision_code: subdivisionCode,
			},
		},
	};
}

function submitCreditsTransaction() {
	// TODO: where does this go?
}

function isMethodEnabled( method, allowedPaymentMethods ) {
	// By default, allow all payment methods
	if ( ! allowedPaymentMethods?.length ) {
		return true;
	}
	return allowedPaymentMethods.includes( method );
}
