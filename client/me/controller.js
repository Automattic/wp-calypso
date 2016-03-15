/**
 * External dependencies
 */
import ReactDom from 'react-dom';
import React from 'react';
import includes from 'lodash/includes';
import page from 'page';

/**
 * Internal dependencies
 */
import analytics from 'analytics';
import devicesFactory from 'lib/devices';
import i18n from 'lib/mixins/i18n';
import notices from 'notices';
import route from 'lib/route';
import sitesFactory from 'lib/sites-list';
import userFactory from 'lib/user';
import userSettings from 'lib/user-settings';
import titleActions from 'lib/screen-title/actions';
import { renderWithReduxStore } from 'lib/react-helpers';

const ANALYTICS_PAGE_TITLE = 'Me',
	devices = devicesFactory(),
	sites = sitesFactory(),
	user = userFactory();

export default {
	sidebar( context, next ) {
		const SidebarComponent = require( 'me/sidebar' );

		renderWithReduxStore(
			React.createElement( SidebarComponent, {
				user,
				context: context
			} ),
			document.getElementById( 'secondary' ),
			context.store
		);

		next();
	},

	profile( context ) {
		const ProfileComponent = require( 'me/profile' ),
			basePath = context.path;

		titleActions.setTitle( i18n.translate( 'My Profile', { textOnly: true } ) );

		analytics.pageView.record( basePath, ANALYTICS_PAGE_TITLE + ' > My Profile' );

		renderWithReduxStore(
			React.createElement( ProfileComponent,
				{
					userSettings: userSettings,
					path: context.path
				}
			),
			document.getElementById( 'primary' ),
			context.store
		);
	},

	password( context ) {
		const PasswordComponent = require( 'me/security/password' ),
			basePath = context.path,
			accountPasswordData = require( 'lib/account-password-data' );

		titleActions.setTitle( i18n.translate( 'Password', { textOnly: true } ) );

		if ( context.query && context.query.updated === 'password' ) {
			notices.success( i18n.translate( 'Your password was saved successfully.' ), { displayOnNextPage: true } );

			page.replace( window.location.pathname );
		}

		analytics.pageView.record( basePath, ANALYTICS_PAGE_TITLE + ' > Password' );

		renderWithReduxStore(
			React.createElement( PasswordComponent,
				{
					userSettings: userSettings,
					path: context.path,
					accountPasswordData: accountPasswordData
				}
			),
			document.getElementById( 'primary' ),
			context.store
		);
	},

	twoStep( context ) {
		const TwoStepComponent = require( 'me/two-step' ),
			basePath = context.path,
			appPasswordsData = require( 'lib/application-passwords-data' );

		titleActions.setTitle( i18n.translate( 'Two-Step Authentication', { textOnly: true } ) );

		analytics.pageView.record( basePath, ANALYTICS_PAGE_TITLE + ' > Two-Step Authentication' );

		renderWithReduxStore(
			React.createElement( TwoStepComponent,
				{
					userSettings: userSettings,
					path: context.path,
					appPasswordsData: appPasswordsData
				}
			),
			document.getElementById( 'primary' ),
			context.store
		);
	},

	connectedApplications( context ) {
		const ConnectedAppsComponent = require( 'me/connected-applications' ),
			basePath = context.path,
			connectedAppsData = require( 'lib/connected-applications-data' );

		titleActions.setTitle( i18n.translate( 'Connected Applications', { textOnly: true } ) );

		analytics.pageView.record( basePath, ANALYTICS_PAGE_TITLE + ' > Connected Applications' );

		renderWithReduxStore(
			React.createElement( ConnectedAppsComponent,
				{
					userSettings: userSettings,
					path: context.path,
					connectedAppsData: connectedAppsData
				}
			),
			document.getElementById( 'primary' ),
			context.store
		);
	},

	securityCheckup( context ) {
		const CheckupComponent = require( 'me/security-checkup' ),
			basePath = context.path;

		titleActions.setTitle( i18n.translate( 'Security Checkup', { textOnly: true } ) );

		analytics.pageView.record( basePath, ANALYTICS_PAGE_TITLE + ' > Security Checkup' );

		renderWithReduxStore(
			React.createElement( CheckupComponent,
				{
					userSettings: userSettings,
					path: context.path
				}
			),
			document.getElementById( 'primary' ),
			context.store
		);
	},

	notifications( context ) {
		const NotificationsComponent = require( 'me/notification-settings' ),
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

	apps( context ) {
		const AppsComponent = require( 'me/get-apps' ),
			basePath = context.path;

		titleActions.setTitle( i18n.translate( 'Get Apps', { textOnly: true } ) );

		analytics.pageView.record( basePath, ANALYTICS_PAGE_TITLE + ' > Get Apps' );

		renderWithReduxStore(
			React.createElement( AppsComponent,
				{
					userSettings: userSettings,
					path: context.path
				}
			),
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
	},

	nextSteps( context ) {
		const analyticsBasePath = route.sectionify( context.path ),
			NextSteps = require( './next-steps' ),
			trophiesData = require( 'lib/trophies-data' ),
			isWelcome = 'welcome' === context.params.welcome;

		titleActions.setTitle( i18n.translate( 'Next Steps', { textOnly: true } ) );

		if ( isWelcome ) {
			ReactDom.unmountComponentAtNode( document.getElementById( 'secondary' ) );
		}

		analytics.tracks.recordEvent( 'calypso_me_next_view', { is_welcome: isWelcome } );
		analytics.pageView.record( analyticsBasePath, ANALYTICS_PAGE_TITLE + ' > Next' );

		renderWithReduxStore(
			React.createElement( NextSteps, {
				path: context.path,
				isWelcome: isWelcome,
				trophiesData: trophiesData
			} ),
			document.getElementById( 'primary' ),
			context.store
		);
	},

	// Users that are redirected to `/me/next?welcome` after signup should visit
	// `/me/next/welcome` instead.
	nextStepsWelcomeRedirect( context, next ) {
		if ( includes( context.path, '?welcome' ) ) {
			return page.redirect( '/me/next/welcome' );
		}

		next();
	},

	profileRedirect() {
		page.redirect( '/me' );
	},

	trophiesRedirect() {
		page.redirect( '/me' );
	},

	findFriendsRedirect() {
		page.redirect( '/me' );
	}
};
