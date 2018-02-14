/** @format */

/**
 * Internal dependencies
 */

import wpcomUndocumented from 'lib/wpcom-undocumented';
import config from 'config';
import { injectLocalization } from './localization';
import wpSupportWrapper from 'lib/wp/support';
import wpcomXhrRequest from 'wpcom-xhr-request';

let wpcom = wpcomUndocumented( wpcomXhrRequest );

if ( config.isEnabled( 'support-user' ) ) {
	wpcom = wpSupportWrapper( wpcom );
}

// Inject localization helpers to `wpcom` instance
wpcom = injectLocalization( wpcom );

export default wpcom;
