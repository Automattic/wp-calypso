/**
 * External dependencies
 */

import page from 'page';

/**
 * Internal dependencies
 */
import { acceptInvite, redirectWithoutLocaleifLoggedIn } from './controller';
import { makeLayout, render as clientRender } from 'controller';

export default () => {
	page(
		'/accept-invite/:site_id?/:invitation_key?/:activation_key?/:auth_key?/:locale?',
		redirectWithoutLocaleifLoggedIn,
		acceptInvite,
		makeLayout,
		clientRender
	);
};
