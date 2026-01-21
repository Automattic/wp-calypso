import page from '@automattic/calypso-router';
import {
	makeLayout,
	render as clientRender,
	redirectIfMultiSiteDashboardForcedOptIn,
} from 'calypso/controller';
import { setupPreferences } from 'calypso/controller/preferences';
import { sidebar } from 'calypso/me/controller';
import { notifications, comments, updates, subscriptions } from './controller';

export default function () {
	page(
		'/me/notifications',
		setupPreferences,
		redirectIfMultiSiteDashboardForcedOptIn( '/me/notifications' ),
		sidebar,
		notifications,
		makeLayout,
		clientRender
	);
	page(
		'/me/notifications/comments',
		setupPreferences,
		redirectIfMultiSiteDashboardForcedOptIn( '/me/notifications/comments' ),
		sidebar,
		comments,
		makeLayout,
		clientRender
	);
	page(
		'/me/notifications/updates',
		setupPreferences,
		redirectIfMultiSiteDashboardForcedOptIn( '/me/notifications/extras' ),
		sidebar,
		updates,
		makeLayout,
		clientRender
	);
	page(
		'/me/notifications/subscriptions',
		setupPreferences,
		redirectIfMultiSiteDashboardForcedOptIn( '/me/notifications/emails' ),
		sidebar,
		subscriptions,
		makeLayout,
		clientRender
	);
}
