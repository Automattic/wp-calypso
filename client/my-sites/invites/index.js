/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { acceptInvite, redirectWithoutLocaleIfLoggedIn } from './controller';

export default () => {
	page(
		'/accept-invite/:site_id?/:invitation_key?/:activation_key?/:auth_key?/:locale?',
		redirectWithoutLocaleIfLoggedIn,
		acceptInvite
	);
};
