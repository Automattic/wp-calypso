/**
 * Internal dependencies
 */
var wpcom = require( 'lib/wp' ).undocumented(),
	paygateLoader = require( 'lib/paygate-loader' );

export function getPaygateParameters( cardDetails ) {
	return {
		name: cardDetails.name,
		number: cardDetails.number,
		cvc: cardDetails.cvv,
		zip: cardDetails['postal-code'],
		country: cardDetails.country,
		exp_month: cardDetails['expiration-date'].substring( 0, 2 ),
		exp_year: '20' + cardDetails['expiration-date'].substring( 3, 5 )
	};
}

export function createToken( requestType, cardDetails, callback ) {
	wpcom.paygateConfiguration( { request_type: requestType }, function( error, configuration ) {
		if ( error ) {
			callback( error );
			return;
		}

		paygateLoader.ready( configuration.js_url, function( error, Paygate ) {
			var parameters;
			if ( error ) {
				callback( error );
				return;
			}

			Paygate.setProcessor( configuration.processor );
			Paygate.setApiUrl( configuration.api_url );
			Paygate.setPublicKey( configuration.public_key );
			Paygate.setEnvironment( configuration.environment );

			parameters = getPaygateParameters( cardDetails );
			Paygate.createToken( parameters, onSuccess, onFailure );
		} );
	} );

	function onSuccess( data ) {
		if ( data.is_error ) {
			return callback( new Error( 'Paygate Response Error: ' + data.error_msg ) );
		}

		callback( null, data.token );
	}

	function onFailure() {
		callback( new Error( 'Paygate Request Error' ) );
	}
}
