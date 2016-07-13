import xhrHandler from 'wpcom-xhr-request';

/**
 * Internal dependencies
 */
import wpcomUndocumented from 'lib/wpcom-undocumented';
import config from 'config';
import { injectLocalization } from './localization';
import { injectEnvelopeHandler } from './handlers/http-envelope-normalizer';

// Create wpcom instance
let wpcom = wpcomUndocumented( xhrHandler );

if ( config.isEnabled( 'support-user' ) ) {
	wpcom = require( 'lib/wp/support' )( wpcom );
}

// Inject localization helpers to `wpcom` instance
wpcom = injectLocalization( wpcom );

// Add http-envelope-normalizer to current request handler
wpcom = injectEnvelopeHandler( wpcom );

module.exports = wpcom;
