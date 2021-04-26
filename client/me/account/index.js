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
import { siteSelection } from 'calypso/my-sites/controller';

export default function () {
	page( '/me/account/:site?', sidebar, account, siteSelection, makeLayout, clientRender );
}
