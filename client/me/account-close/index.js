/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { accountClose, accountClosed } from './controller';
import { makeLayout, render as clientRender } from 'controller';
import { sidebar } from 'me/controller';
import { isEnabled } from 'config';

export default function () {
	if ( isEnabled( 'me/account-close' ) ) {
		page( '/me/account/close', sidebar, accountClose, makeLayout, clientRender );
		page( '/me/account/closed', accountClosed, makeLayout, clientRender );
	}
}
