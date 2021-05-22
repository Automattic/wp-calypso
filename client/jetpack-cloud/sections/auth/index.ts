/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { connect, tokenRedirect } from './controller';
import { makeLayout, render as clientRender } from 'calypso/controller';
import config from '@automattic/calypso-config';

export default (): void => {
	if ( config.isEnabled( 'jetpack-cloud' ) ) {
		page( '/connect', connect, makeLayout, clientRender );
		page( '/connect/oauth/token', tokenRedirect, makeLayout, clientRender );
	}
};
