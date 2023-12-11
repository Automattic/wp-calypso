import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { sidebar } from 'calypso/me/controller';
import { notifications, comments, updates, subscriptions } from './controller';

export default function () {
	page( '/me/notifications', sidebar, notifications, makeLayout, clientRender );
	page( '/me/notifications/comments', sidebar, comments, makeLayout, clientRender );
	page( '/me/notifications/updates', sidebar, updates, makeLayout, clientRender );
	page( '/me/notifications/subscriptions', sidebar, subscriptions, makeLayout, clientRender );
}
