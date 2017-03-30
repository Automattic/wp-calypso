/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import meController from 'me/controller';
import controller from './controller';

import { makeLayout, render as clientRender } from 'controller';

export default function() {
	page(
	 '/me/notifications',
	 meController.sidebar,
	 controller.notifications,
	 makeLayout,
	 clientRender
	);
	page(
	 '/me/notifications/comments',
	 meController.sidebar,
	 controller.comments,
	 makeLayout,
	 clientRender
	);
	page(
	 '/me/notifications/updates',
	 meController.sidebar,
	 controller.updates,
	 makeLayout,
	 clientRender
	);
	page(
	 '/me/notifications/subscriptions',
	 meController.sidebar,
	 controller.notificationSubscriptions,
	 makeLayout,
	 clientRender
	);
}
