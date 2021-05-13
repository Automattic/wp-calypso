/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import paymentGatewayLoader from 'calypso/lib/payment-gateway-loader';
import wp from 'calypso/lib/wp';
import { translatedEbanxError } from 'calypso/lib/checkout/processor-specific';

const debug = debugFactory( 'calypso:store-transactions' );
const wpcom = wp.undocumented();

const promisifiedEbanxConfiguration = ( data ) => {
	return new Promise( ( resolve, reject ) => {
		wpcom.ebanxConfiguration( data, ( configError, configuration ) => {
			if ( configError ) {
				return reject( configError );
			}
			resolve( configuration );
		} );
	} );
};

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

	const configuration = await promisifiedEbanxConfiguration( { request_type: requestType } );
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
	const config = await wpcom.stripeConfiguration( requestArgs );
	debug( 'Stripe configuration', config );
	return config;
}
