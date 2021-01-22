/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { authConnectPath, authTokenRedirectPath, authUserInitializeRedirectPath } from './paths';
import { connect, tokenRedirect, userInitialize } from './controller';
import { makeLayout, render as clientRender } from 'calypso/controller';
import config from 'calypso/config';

export default (): void => {
	if ( config.isEnabled( 'jetpack-cloud' ) ) {
		page( authConnectPath(), connect, makeLayout, clientRender );
		page( authTokenRedirectPath(), tokenRedirect, userInitialize, makeLayout, clientRender );

		if ( config.isEnabled( 'oauth-pass-grant-type' ) ) {
			page( authUserInitializeRedirectPath(), userInitialize, makeLayout, clientRender );
		}
	}
};
