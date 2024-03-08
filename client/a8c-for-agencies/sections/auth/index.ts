import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { connect, tokenRedirect } from './controller';

export default (): void => {
	if ( config.isEnabled( 'a8c-for-agencies' ) ) {
		page( '/connect', connect, makeLayout, clientRender );
		page( '/connect/oauth/token', tokenRedirect, makeLayout, clientRender );
	}
};
