import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import { connect, logIn, tokenRedirect } from './controller';

export default (): void => {
	if ( isA8CForAgencies() ) {
		page( '/connect', connect, makeLayout, clientRender );
		page( '/connect/oauth/token', tokenRedirect, makeLayout, clientRender );
		page( '/log-in', logIn, makeLayout, clientRender );
	}
};
