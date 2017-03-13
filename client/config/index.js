// DO NOT USE ES6 MODULES  OR IT WILL BREAK wp-desktop COMPATIBILITY
/**
 * Internal dependencies
 */
var createConfig = require( 'lib/config' );

/**
 * Manages config flags for various deployment builds
 * @module config/index
 */
if ( 'undefined' === typeof window || ! window.configData ) {
	throw new ReferenceError( 'No configuration was found: please see client/config/README.md for more information' );
}

module.exports = createConfig( window.configData );

