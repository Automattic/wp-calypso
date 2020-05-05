/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { notifications, comments, updates, subscriptions } from './controller';
import { sidebar } from 'me/controller';
import { makeLayout, render as clientRender } from 'controller';

export default function () {
	page( '/me/notifications', sidebar, notifications, makeLayout, clientRender );
	page( '/me/notifications/comments', sidebar, comments, makeLayout, clientRender );
	page( '/me/notifications/updates', sidebar, updates, makeLayout, clientRender );
	page( '/me/notifications/subscriptions', sidebar, subscriptions, makeLayout, clientRender );
}
