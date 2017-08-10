/** @format */
/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:paygate' );

/**
 * Internal dependencies
 */
var loadScript = require( 'lib/load-script' );

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
 * @param {function} callback - the callback function
 * @returns {void}
 */
PaygateLoader.prototype.ready = function( paygateUrl, callback ) {
	if ( window.Paygate ) {
		return callback( null, window.Paygate );
	}

	loadScript.loadjQueryDependentScript(
		paygateUrl,
		function( error ) {
			if ( error ) {
				callback( error );
				return;
			}

			debug( 'Paygate loaded for the first time' );
			callback( null, window.Paygate );
		}.bind( this )
	);
};

/**
 * Expose `PaygateLoader`
 */
module.exports = new PaygateLoader();
