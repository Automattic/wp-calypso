/**
 * Internal dependencies
 */
var wpcom = require( 'lib/wpcom-undocumented' );
var config = require( 'config' );

wpcom = wpcom( require( 'wpcom-xhr-request' ) );

if ( config.isEnabled( 'support-user' ) ) {
	wpcom = require( 'lib/wp/support' )( wpcom );
}

module.exports = wpcom;
