/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { accountClose, accountClosed } from './controller';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { sidebar } from 'calypso/me/controller';
import { isEnabled } from 'calypso/config';

export default function () {
	if ( isEnabled( 'me/account-close' ) ) {
		page( '/me/account/close', sidebar, accountClose, makeLayout, clientRender );
		page( '/me/account/closed', accountClosed, makeLayout, clientRender );
	}
}
