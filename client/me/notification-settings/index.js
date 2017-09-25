/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import meController from 'me/controller';
import controller from './controller';

export default function() {
	page( '/me/notifications', meController.sidebar, controller.notifications );
	page( '/me/notifications/comments', meController.sidebar, controller.comments );
	page( '/me/notifications/updates', meController.sidebar, controller.updates );
	page( '/me/notifications/subscriptions', meController.sidebar, controller.notificationSubscriptions );
}
