/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import controller from './controller';

export default () => {
	page(
		'/accept-invite/:site_id/:invitation_key',
		controller.acceptInvite
	);
};
