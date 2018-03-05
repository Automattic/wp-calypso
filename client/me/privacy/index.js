/** @format */

/**
 * External dependencies
 */

import page from 'page';

/**
 * Internal dependencies
 */
import meController from 'me/controller';
import privacyController from './controller';
import { makeLayout, render as clientRender } from 'controller';

export default function() {
	page( '/me/privacy', meController.sidebar, privacyController, makeLayout, clientRender );
}
