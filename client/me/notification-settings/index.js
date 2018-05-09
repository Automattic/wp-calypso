/** @format */

/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import * as controller from './controller';
import { makeLayout, render as clientRender } from 'controller';
import { sidebar } from 'me/controller';

export default function() {
	page( '/me/notifications', sidebar, controller.notifications, makeLayout, clientRender );

	page( '/me/notifications/comments', sidebar, controller.comments, makeLayout, clientRender );

	page( '/me/notifications/updates', sidebar, controller.updates, makeLayout, clientRender );

	page(
		'/me/notifications/subscriptions',
		sidebar,
		controller.notificationSubscriptions,
		makeLayout,
		clientRender
	);
}
