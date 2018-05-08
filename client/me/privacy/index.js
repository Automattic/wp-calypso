/** @format */

/**
 * External dependencies
 */

import page from 'page';

/**
 * Internal dependencies
 */
import { sidebar } from 'me/controller';
import { privacy } from './controller';
import { makeLayout, render as clientRender } from 'controller';

export default function() {
	page( '/me/privacy', sidebar, privacy, makeLayout, clientRender );
}
