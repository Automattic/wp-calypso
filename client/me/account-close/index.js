/** @format */

/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { accountClose } from './controller';
import { makeLayout, render as clientRender } from 'controller';
import { sidebar } from 'me/controller';

export default function() {
	page( '/me/account/close', sidebar, accountClose, makeLayout, clientRender );
}
