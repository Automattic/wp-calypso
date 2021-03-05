/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { authConnectPath, authTokenRedirectPath } from './paths';
import { connect, tokenRedirect } from './controller';
import { makeLayout, render as clientRender } from 'calypso/controller';
import config from '@automattic/calypso-config';

export default () => {
	if ( config.isEnabled( 'jetpack-cloud' ) ) {
		page( authConnectPath(), connect, makeLayout, clientRender );
		page( authTokenRedirectPath(), tokenRedirect, makeLayout, clientRender );
	}
};
