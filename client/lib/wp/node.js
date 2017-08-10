/** @format */
/**
 * Internal dependencies
 */
import wpcomUndocumented from 'lib/wpcom-undocumented';
import config from 'config';
import { injectLocalization } from './localization';

let wpcom = wpcomUndocumented( require( 'wpcom-xhr-request' ) );

if ( config.isEnabled( 'support-user' ) ) {
	wpcom = require( 'lib/wp/support' )( wpcom );
}

// Inject localization helpers to `wpcom` instance
wpcom = injectLocalization( wpcom );

module.exports = wpcom;
