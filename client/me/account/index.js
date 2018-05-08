/** @format */

/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { sidebar } from 'me/controller';
import { account } from './controller';
import { makeLayout, render as clientRender } from 'controller';

export default function() {
	page( '/me/account', sidebar, account, makeLayout, clientRender );
}
