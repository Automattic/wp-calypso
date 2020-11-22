/**
 * Internal dependencies
 */

import wpcomUndocumented from 'calypso/lib/wpcom-undocumented';
import config from 'calypso/config';
import { injectLocalization } from './localization';
import wpSupportWrapper from 'calypso/lib/wp/support';
import wpcomXhrRequest from 'wpcom-xhr-request';

let wpcom = wpcomUndocumented( wpcomXhrRequest );

if ( config.isEnabled( 'support-user' ) ) {
	wpcom = wpSupportWrapper( wpcom );
}

// Inject localization helpers to `wpcom` instance
wpcom = injectLocalization( wpcom );

export default wpcom;
