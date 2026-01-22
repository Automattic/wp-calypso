import page from '@automattic/calypso-router';
import {
	makeLayout,
	render as clientRender,
	maybeRedirectToMultiSiteDashboard,
} from 'calypso/controller';
import { setupPreferences } from 'calypso/controller/preferences';
import { sidebar } from 'calypso/me/controller';
import { notifications, comments, updates, subscriptions } from './controller';

export default function () {
	page(
		'/me/notifications',
		setupPreferences,
		maybeRedirectToMultiSiteDashboard( '/me/notifications' ),
		sidebar,
		notifications,
		makeLayout,
		clientRender
	);
	page(
		'/me/notifications/comments',
		setupPreferences,
		maybeRedirectToMultiSiteDashboard( '/me/notifications/comments' ),
		sidebar,
		comments,
		makeLayout,
		clientRender
	);
	page(
		'/me/notifications/updates',
		setupPreferences,
		maybeRedirectToMultiSiteDashboard( '/me/notifications/extras' ),
		sidebar,
		updates,
		makeLayout,
		clientRender
	);
	page(
		'/me/notifications/subscriptions',
		setupPreferences,
		maybeRedirectToMultiSiteDashboard( '/me/notifications/emails' ),
		sidebar,
		subscriptions,
		makeLayout,
		clientRender
	);
}
