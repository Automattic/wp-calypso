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
import titleActions from 'lib/screen-title/actions';
import { renderWithReduxStore } from 'lib/react-helpers';
import devicesFactory from 'lib/devices';
import sitesFactory from 'lib/sites-list';
import userFactory from 'lib/user';

const ANALYTICS_PAGE_TITLE = 'Me';
const devices = devicesFactory();
const sites = sitesFactory();
const user = userFactory();

export default {
	notifications( context ) {
		const NotificationsComponent = require( 'me/notification-settings/main' ),
			basePath = context.path;

		titleActions.setTitle( i18n.translate( 'Notifications', { textOnly: true } ) );

		analytics.pageView.record( basePath, ANALYTICS_PAGE_TITLE + ' > Notifications' );

		renderWithReduxStore(
			React.createElement( NotificationsComponent, {
				user: user,
				userSettings: userSettings,
				blogs: sites,
				devices: devices,
				path: context.path
			} ),
			document.getElementById( 'primary' ),
			context.store
		);
	},

	comments( context ) {
		const CommentSettingsComponent = require( 'me/notification-settings/comment-settings' ),
			basePath = context.path;

		titleActions.setTitle( i18n.translate( 'Comments on other sites', { textOnly: true } ) );

		analytics.pageView.record( basePath, ANALYTICS_PAGE_TITLE + ' > Notifications > Comments on other sites' );

		renderWithReduxStore(
			React.createElement( CommentSettingsComponent,
				{
					user: user,
					devices: devices,
					path: context.path
				}
			),
			document.getElementById( 'primary' ),
			context.store
		);
	},

	updates( context ) {
		const WPcomSettingsComponent = require( 'me/notification-settings/wpcom-settings' ),
			basePath = context.path;

		titleActions.setTitle( i18n.translate( 'Updates from WordPress.com', { textOnly: true } ) );

		analytics.pageView.record( basePath, ANALYTICS_PAGE_TITLE + ' > Notifications > Updates from WordPress.com' );

		renderWithReduxStore(
			React.createElement( WPcomSettingsComponent,
				{
					user: user,
					devices: devices,
					path: context.path
				}
			),
			document.getElementById( 'primary' ),
			context.store
		);
	},

	notificationSubscriptions( context ) {
		const NotificationSubscriptions = require( 'me/notification-settings/reader-subscriptions' ),
			basePath = context.path;

		titleActions.setTitle( i18n.translate( 'Notifications', { textOnly: true } ) );

		analytics.ga.recordPageView( basePath, ANALYTICS_PAGE_TITLE + ' > Notifications > Comments on other sites' );

		renderWithReduxStore(
			React.createElement( NotificationSubscriptions,
				{
					userSettings: userSettings,
					path: context.path
				}
			),
			document.getElementById( 'primary' ),
			context.store
		);
	}
};
