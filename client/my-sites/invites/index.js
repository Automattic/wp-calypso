/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { acceptInvite } from './controller';

export default () => {
	page(
		'/accept-invite/:site_id?/:invitation_key?/:activation_key?/:auth_key?',
		acceptInvite
	);
};
