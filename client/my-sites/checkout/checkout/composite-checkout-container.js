/**
 * External dependencies
 */
import React from 'react';
import {
	createRegistry,
	createPayPalMethod,
	createStripeMethod,
	createApplePayMethod,
} from '@automattic/composite-checkout';
import { WPCheckoutWrapper, mockPayPalExpressRequest } from '@automattic/composite-checkout-wpcom';
import { useTranslate } from 'i18n-calypso';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import wp from 'lib/wp';
import notices from 'notices';

const debug = debugFactory( 'calypso:composite-checkout-container' );

const registry = createRegistry();
const { registerStore, select } = registry;

const wpcom = wp.undocumented();

async function fetchStripeConfiguration( requestArgs ) {
	return wpcom.stripeConfiguration( requestArgs );
}

async function sendStripeTransaction( transactionData ) {
	return wpcom.transactions( transactionData );
}

function getDomainDetails() {
	const isDomainContactSame = select( 'wpcom' )?.isDomainContactSame?.() ?? false;
	const {
		firstName,
		lastName,
		email,
		phoneNumber,
		address,
		city,
		state,
		country,
		postalCode,
	} = isDomainContactSame
		? select( 'wpcom' )?.getContactInfo?.() ?? {}
		: select( 'wpcom' )?.getDomainContactInfo?.() ?? {};
	// TODO: what is getContactInfo for other than the domainDetails?
	return {
		firstName,
		lastName,
		email,
		phoneNumber,
		address,
		city,
		state,
		country,
		postalCode,
	};
}

const stripeMethod = createStripeMethod( {
	getSiteId: () => select( 'wpcom' )?.getSiteId?.(),
	getCountry: () => select( 'wpcom' )?.getContactInfo?.()?.country?.value,
	getPostalCode: () => select( 'wpcom' )?.getContactInfo?.()?.postalCode?.value,
	getPhoneNumber: () => select( 'wpcom' )?.getContactInfo?.()?.phoneNumber?.value,
	getSubdivisionCode: () => select( 'wpcom' )?.getContactInfo?.()?.state?.value,
	getDomainDetails,
	registerStore,
	fetchStripeConfiguration,
	sendStripeTransaction,
} );

const paypalMethod = createPayPalMethod( {
	registerStore: registerStore,
	makePayPalExpressRequest: mockPayPalExpressRequest,
} );

const applePayMethod = isApplePayAvailable()
	? createApplePayMethod( {
			registerStore,
			fetchStripeConfiguration,
	  } )
	: null;

export function isApplePayAvailable() {
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

const availablePaymentMethods = [ applePayMethod, stripeMethod, paypalMethod ].filter( Boolean );

// Aliasing getCart and setCart explicitly bound to wpcom is
// required here; otherwise we get `this is not defined` errors.
const getCart = ( ...args ) => wpcom.getCart( ...args );
const setCart = ( ...args ) => wpcom.setCart( ...args );

export default function CompositeCheckoutContainer( { siteId, siteSlug } ) {
	const translate = useTranslate();
	const onSuccess = () => {
		debug( 'success' );
		notices.success( translate( 'Your purchase was successful!' ) );
	};

	const onFailure = error => {
		debug( 'error', error );
		const message = error && error.toString ? error.toString() : error;
		notices.error( message || translate( 'An error occurred during your purchase.' ) );
	};

	return (
		<WPCheckoutWrapper
			siteSlug={ siteSlug }
			getCart={ getCart }
			setCart={ setCart }
			availablePaymentMethods={ availablePaymentMethods }
			registry={ registry }
			siteId={ siteId }
			onSuccess={ onSuccess }
			onFailure={ onFailure }
		/>
	);
}
