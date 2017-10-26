/**
 * External dependencies
 *
 * @format
 */

import debugFactory from 'debug';

const debug = debugFactory( 'calypso:payment-gateway' );

/**
 * Internal dependencies
 */
import { loadjQueryDependentScript } from 'lib/load-script';

/**
 * PaymentGatewayLoader component
 *
 * @api public
 * @returns { PaymentGatewayLoader } - an instance of PaymentGatewayLoader
 */
function PaymentGatewayLoader() {
	if ( ! ( this instanceof PaymentGatewayLoader ) ) {
		return new PaymentGatewayLoader();
	}
}

/**
 * After the external payment gateway script has loaded, this method calls the
 * `callback` with the `gatewayNamespace` class as its first argument
 *
 * @api public
 * @param {string} gatewayUrl - the URL to fetch the script
 * @param {string} gatewayNamespace - the global namespace of the script
 * @param {function} callback - the callback function
 * @returns {void}
 */
PaymentGatewayLoader.prototype.ready = function( gatewayUrl, gatewayNamespace, callback ) {
	if ( window[ gatewayNamespace ] ) {
		return callback( null, window[ gatewayNamespace ] );
	}

	loadjQueryDependentScript(
		gatewayUrl,
		function( error ) {
			if ( error ) {
				callback( error );
				return;
			}

			debug( 'Payment gateway ' + gatewayNamespace + ' loaded for the first time' );
			callback( null, window[ gatewayNamespace ] );
		}.bind( this )
	);
};

/**
 * Expose `PaymentGatewayLoader`
 */
export default new PaymentGatewayLoader();
