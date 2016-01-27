/**
 * Internal dependencies
 */
import wpcomSupport from 'lib/wp/support';
import config from 'config';

var wpcom = require( 'lib/wpcom-undocumented' );

wpcom = wpcom( require( 'wpcom-xhr-request' ) );

if ( config.isEnabled( 'support-user' ) ) {
	wpcom = wpcomSupport( wpcom );
}

module.exports = wpcom;
