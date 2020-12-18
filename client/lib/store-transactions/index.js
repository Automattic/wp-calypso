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

export async function createEbanxToken( requestType, cardDetails ) {
	debug( 'creating token with ebanx' );

	return new Promise( function ( resolve, reject ) {
		wpcom.ebanxConfiguration(
			{
				request_type: requestType,
			},
			function ( configError, configuration ) {
				if ( configError ) {
					reject( configError );
				}

				return paymentGatewayLoader
					.ready( configuration.js_url, 'EBANX', false )
					.then( ( Ebanx ) => {
						Ebanx.config.setMode( configuration.environment );
						Ebanx.config.setPublishableKey( configuration.public_key );
						Ebanx.config.setCountry( cardDetails.country.toLowerCase() );

						const parameters = getEbanxParameters( cardDetails );
						Ebanx.card.createToken( parameters, function ( ebanxResponse ) {
							Ebanx.deviceFingerprint.setup( function ( deviceId ) {
								ebanxResponse.data.deviceId = deviceId;
								return createTokenCallback( ebanxResponse, resolve, reject );
							} );
						} );
					} )
					.catch( ( loaderError ) => {
						reject( loaderError );
					} );
			}
		);
	} );

	function createTokenCallback( ebanxResponse, resolve, reject ) {
		if ( ebanxResponse.error.hasOwnProperty( 'err' ) ) {
			return reject( translatedEbanxError( ebanxResponse.error.err ) );
		}

		ebanxResponse.data.paymentMethod = 'WPCOM_Billing_Ebanx';
		return resolve( ebanxResponse.data );
	}
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
