/**
 * External dependencies
 */

import page from 'page';

/**
 * Internal dependencies
 */
import { makeLayout, render as clientRender } from 'calypso/controller';
import { privacy } from './controller';
import { sidebar } from 'calypso/me/controller';

export default function () {
	page( '/me/privacy', sidebar, privacy, makeLayout, clientRender );
}
