/**
 * External dependencies
 */

import debugFactory from 'debug';

const debug = debugFactory( 'calypso:payment-gateway' );

/**
 * Internal dependencies
 */
import { loadScript } from '@automattic/load-script';

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
 * @returns {Promise} promise
 */
PaymentGatewayLoader.prototype.ready = function ( gatewayUrl, gatewayNamespace ) {
	return new Promise( ( resolve, reject ) => {
		if ( window[ gatewayNamespace ] ) {
			resolve( window[ gatewayNamespace ] );
			return;
		}

		loadScript( gatewayUrl, function ( error ) {
			if ( error ) {
				reject( error );
				return;
			}

			debug( 'Payment gateway ' + gatewayNamespace + ' loaded for the first time' );
			resolve( window[ gatewayNamespace ] );
		} );
	} );
};

/**
 * Expose `PaymentGatewayLoader`
 */
export default new PaymentGatewayLoader();
