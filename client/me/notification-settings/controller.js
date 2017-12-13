/** @format */

/**
 * External dependencies
 */

import React from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import userSettings from 'lib/user-settings';
import { setDocumentHeadTitle as setTitle } from 'state/document-head/actions';
import NotificationsComponent from 'me/notification-settings/main';
import CommentSettingsComponent from 'me/notification-settings/comment-settings';
import WPcomSettingsComponent from 'me/notification-settings/wpcom-settings';
import NotificationSubscriptions from 'me/notification-settings/reader-subscriptions';

const ANALYTICS_PAGE_TITLE = 'Me';

export default {
	notifications( context, next ) {
		const basePath = context.path;

		// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
		context.store.dispatch( setTitle( i18n.translate( 'Notifications', { textOnly: true } ) ) );

		analytics.pageView.record( basePath, ANALYTICS_PAGE_TITLE + ' > Notifications' );

		context.primary = React.createElement( NotificationsComponent, {
			userSettings: userSettings,
			path: context.path,
		} );
		next();
	},

	comments( context, next ) {
		const basePath = context.path;

		// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
		context.store.dispatch(
			setTitle( i18n.translate( 'Comments on other sites', { textOnly: true } ) )
		);

		analytics.pageView.record(
			basePath,
			ANALYTICS_PAGE_TITLE + ' > Notifications > Comments on other sites'
		);

		context.primary = React.createElement( CommentSettingsComponent, {
			path: context.path,
		} );
		next();
	},

	updates( context, next ) {
		const basePath = context.path;

		// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
		context.store.dispatch(
			setTitle( i18n.translate( 'Updates from WordPress.com', { textOnly: true } ) )
		);

		analytics.pageView.record(
			basePath,
			ANALYTICS_PAGE_TITLE + ' > Notifications > Updates from WordPress.com'
		);

		context.primary = React.createElement( WPcomSettingsComponent, {
			path: context.path,
		} );
		next();
	},

	notificationSubscriptions( context, next ) {
		const basePath = context.path;

		// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
		context.store.dispatch( setTitle( i18n.translate( 'Notifications', { textOnly: true } ) ) );

		analytics.ga.recordPageView(
			basePath,
			ANALYTICS_PAGE_TITLE + ' > Notifications > Comments on other sites'
		);

		context.primary = React.createElement( NotificationSubscriptions, {
			userSettings: userSettings,
			path: context.path,
		} );
		next();
	},
};
