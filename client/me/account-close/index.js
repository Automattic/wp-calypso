import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { sidebar } from 'calypso/me/controller';
import { accountClose, accountClosed } from './controller';

export default function () {
	if ( isEnabled( 'me/account-close' ) ) {
		page( '/me/account/close', sidebar, accountClose, makeLayout, clientRender );
		page( '/me/account/closed', accountClosed, makeLayout, clientRender );
	}
}
