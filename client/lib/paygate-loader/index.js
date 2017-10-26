/**
 * External dependencies
 *
 * @format
 */

import debugFactory from 'debug';

const debug = debugFactory( 'calypso:paygate' );

/**
 * Internal dependencies
 */
import { loadjQueryDependentScript } from 'lib/load-script';

/**
 * PaygateLoader component
 *
 * @api public
 * @returns { PaygateLoader } - an instance of PaygateLoader
 */
function PaygateLoader() {
	if ( ! ( this instanceof PaygateLoader ) ) {
		return new PaygateLoader();
	}
}

/**
 * After the external Paygate script has loaded, this method calls the
 * `callback` with the `Paygate` class as its first argument
 *
 * @api public
 * @param {string} paygateUrl - the URL to fetch the paygate script
 * @param {string} paygateNamespace - the global namespace of the script
 * @param {function} callback - the callback function
 * @returns {void}
 */
PaygateLoader.prototype.ready = function( paygateUrl, paygateNamespace, callback ) {
	if ( window[ paygateNamespace ] ) {
		return callback( null, window[ paygateNamespace ] );
	}

	loadjQueryDependentScript(
		paygateUrl,
		function( error ) {
			if ( error ) {
				callback( error );
				return;
			}

			debug( 'Paygate loaded for the first time' );
			callback( null, window[ paygateNamespace ] );
		}.bind( this )
	);
};

/**
 * Expose `PaygateLoader`
 */
export default new PaygateLoader();
