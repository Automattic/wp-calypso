/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { authConnectPath, authConnectLogoutPath, authTokenRedirectPath } from './paths';
import { connect, logoutRedirect, tokenRedirect } from './controller';
import { makeLayout, render as clientRender } from 'controller';
import config from 'config';

export default () => {
	if ( config.isEnabled( 'jetpack-cloud' ) ) {
		page( authConnectPath(), connect, makeLayout, clientRender );
		page( authTokenRedirectPath(), tokenRedirect, makeLayout, clientRender );
		page( authConnectLogoutPath(), logoutRedirect, makeLayout, clientRender );
	}
};
