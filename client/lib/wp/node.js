/**
 * Internal dependencies
 */
import { injectLocalization } from './localization';
import config from 'config';
import wpcomUndocumented from 'lib/wpcom-undocumented';

let wpcom = wpcomUndocumented( require( 'wpcom-xhr-request' ) );

if ( config.isEnabled( 'support-user' ) ) {
	wpcom = require( 'lib/wp/support' )( wpcom );
}

// Inject localization helpers to `wpcom` instance
wpcom = injectLocalization( wpcom );

export default wpcom;
