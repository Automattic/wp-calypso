import debugFactory from 'debug';
import { translatedEbanxError } from 'calypso/lib/checkout/processor-specific';
import paymentGatewayLoader from 'calypso/lib/payment-gateway-loader';
import wp from 'calypso/lib/wp';

const debug = debugFactory( 'calypso:store-transactions' );

const promisifiedCreateEbanxToken = ( ebanx, parameters ) => {
	return new Promise( ( resolve ) => {
		ebanx.card.createToken( parameters, function ( ebanxResponse ) {
			resolve( ebanxResponse );
		} );
	} );
};

const promisifiedEbanxDeviceFingerprint = ( ebanx ) => {
	return new Promise( ( resolve ) => {
		ebanx.deviceFingerprint.setup( function ( deviceId ) {
			resolve( deviceId );
		} );
	} );
};

export async function createEbanxToken( requestType, cardDetails ) {
	debug( 'creating token with ebanx' );

	const configuration = await wp.req.get( '/me/ebanx-configuration', {
		request_type: requestType,
	} );
	const ebanx = await paymentGatewayLoader.ready( configuration.js_url, 'EBANX', false );

	ebanx.config.setMode( configuration.environment );
	ebanx.config.setPublishableKey( configuration.public_key );
	ebanx.config.setCountry( cardDetails.country.toLowerCase() );

	const parameters = getEbanxParameters( cardDetails );
	const ebanxResponse = await promisifiedCreateEbanxToken( ebanx, parameters );
	debug( 'ebanx token creation response', ebanxResponse );

	const deviceId = await promisifiedEbanxDeviceFingerprint( ebanx );
	ebanxResponse.data.deviceId = deviceId;
	const validatedData = await validateAndNormalizeEbanxResponse( ebanxResponse );
	return validatedData;
}

async function validateAndNormalizeEbanxResponse( ebanxResponse ) {
	if ( ebanxResponse.error.hasOwnProperty( 'err' ) ) {
		throw new Error( translatedEbanxError( ebanxResponse.error.err ) );
	}
	ebanxResponse.data.paymentMethod = 'WPCOM_Billing_Ebanx';
	return ebanxResponse.data;
}

function getEbanxParameters( cardDetails ) {
	return {
		card_name: cardDetails.name,
		card_number: cardDetails.number,
		card_cvv: cardDetails.cvv,
		card_due_date:
			cardDetails[ 'expiration-date' ].substring( 0, 2 ) +
			'/20' +
			cardDetails[ 'expiration-date' ].substring( 3, 5 ),
	};
}

export async function getStripeConfiguration( requestArgs ) {
	const config = await wp.req.get( '/me/stripe-configuration', requestArgs );
	debug( 'Stripe configuration', config );
	return config;
}

export async function getRazorpayConfiguration( requestArgs ) {
	const config = await wp.req.get( '/me/razorpay-configuration', requestArgs );
	debug( 'RazorPay configuration', config );
	return config;
}

export async function confirmRazorpayOrder( requestArgs ) {
	const response = await wp.req.post( '/me/razorpay-confirm-payment', requestArgs );
	debug( 'Razorpay order confirmation response', response );
	return response;
}
