/**
 * External dependencies
 */

import page from 'page';

/**
 * Internal dependencies
 */
import { acceptInvite, redirectWithoutLocaleifLoggedIn } from './controller';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { getLanguageRouteParam } from 'calypso/lib/i18n-utils';

export default () => {
	const locale = getLanguageRouteParam( 'locale' );

	page(
		[
			`/accept-invite/:site_id/:invitation_key/${ locale }`,
			`/accept-invite/:site_id/:invitation_key/:activation_key/${ locale }`,
			`/accept-invite/:site_id/:invitation_key/:activation_key/:auth_key/${ locale }`,
		],
		redirectWithoutLocaleifLoggedIn,
		acceptInvite,
		makeLayout,
		clientRender
	);
};
