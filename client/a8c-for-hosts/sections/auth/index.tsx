import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import isA8CForHosts from 'calypso/lib/a8c-for-hosts/is-a8c-for-hosts';
import { connect, tokenRedirect } from './controller';

export default (): void => {
	if ( isA8CForHosts() ) {
		page( '/connect', connect, makeLayout, clientRender );
		page( '/connect/oauth/token', tokenRedirect, makeLayout, clientRender );
	}
};
