/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { acceptInvite, inviteNotices } from './controller';

export default () => {
	page(
		'*',
		inviteNotices
	);

	page(
		'/accept-invite/:site_id/:invitation_key',
		acceptInvite
	);

	page(
		'/accept-invite/:site_id/:invitation_key/:activation_key/:auth_key',
		acceptInvite
	);
};
