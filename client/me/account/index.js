/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { account } from './controller';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { sidebar } from 'calypso/me/controller';

export default function () {
	page( '/me/account', sidebar, account, makeLayout, clientRender );
}
