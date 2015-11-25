/**
 * Internal Dependencies
 */
var config = require( 'config' );

function warn() {
	if ( config( 'env' ) !== 'production' ) {
		try {
			window.console.warn.apply( window.console, arguments );
		} catch ( e ) {
			// Squelch
		}
	}
}

module.exports = warn;
