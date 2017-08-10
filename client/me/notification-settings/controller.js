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
import { renderWithReduxStore } from 'lib/react-helpers';
import NotificationsComponent from 'me/notification-settings/main';
import CommentSettingsComponent from 'me/notification-settings/comment-settings';
import WPcomSettingsComponent from 'me/notification-settings/wpcom-settings';
import NotificationSubscriptions from 'me/notification-settings/reader-subscriptions';

const ANALYTICS_PAGE_TITLE = 'Me';

export default {
	notifications( context ) {
		const basePath = context.path;

		// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
		context.store.dispatch( setTitle( i18n.translate( 'Notifications', { textOnly: true } ) ) );

		analytics.pageView.record( basePath, ANALYTICS_PAGE_TITLE + ' > Notifications' );

		renderWithReduxStore(
			React.createElement( NotificationsComponent, {
				userSettings: userSettings,
				path: context.path,
			} ),
			document.getElementById( 'primary' ),
			context.store
		);
	},

	comments( context ) {
		const basePath = context.path;

		// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
		context.store.dispatch(
			setTitle( i18n.translate( 'Comments on other sites', { textOnly: true } ) )
		);

		analytics.pageView.record(
			basePath,
			ANALYTICS_PAGE_TITLE + ' > Notifications > Comments on other sites'
		);

		renderWithReduxStore(
			React.createElement( CommentSettingsComponent, {
				path: context.path,
			} ),
			document.getElementById( 'primary' ),
			context.store
		);
	},

	updates( context ) {
		const basePath = context.path;

		// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
		context.store.dispatch(
			setTitle( i18n.translate( 'Updates from WordPress.com', { textOnly: true } ) )
		);

		analytics.pageView.record(
			basePath,
			ANALYTICS_PAGE_TITLE + ' > Notifications > Updates from WordPress.com'
		);

		renderWithReduxStore(
			React.createElement( WPcomSettingsComponent, {
				path: context.path,
			} ),
			document.getElementById( 'primary' ),
			context.store
		);
	},

	notificationSubscriptions( context ) {
		const basePath = context.path;

		// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
		context.store.dispatch( setTitle( i18n.translate( 'Notifications', { textOnly: true } ) ) );

		analytics.ga.recordPageView(
			basePath,
			ANALYTICS_PAGE_TITLE + ' > Notifications > Comments on other sites'
		);

		renderWithReduxStore(
			React.createElement( NotificationSubscriptions, {
				userSettings: userSettings,
				path: context.path,
			} ),
			document.getElementById( 'primary' ),
			context.store
		);
	},
};
