/** @format */

/**
 * External dependencies
 */

import React from 'react';
import page from 'page';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import notices from 'notices';
import userSettings from 'lib/user-settings';
import PasswordComponent from 'me/security/main';
import accountPasswordData from 'lib/account-password-data';
import SocialLoginComponent from 'me/social-login';
import ConnectedAppsComponent from 'me/connected-applications';
import connectedAppsData from 'lib/connected-applications-data';
import appPasswordsData from 'lib/application-passwords-data';
import AccountRecoveryComponent from 'me/security-account-recovery';

const ANALYTICS_PAGE_TITLE = 'Me';

export default {
	password( context, next ) {
		const basePath = context.path;

		if ( context.query && context.query.updated === 'password' ) {
			notices.success( i18n.translate( 'Your password was saved successfully.' ), {
				displayOnNextPage: true,
			} );

			page.replace( window.location.pathname );
		}

		analytics.pageView.record( basePath, ANALYTICS_PAGE_TITLE + ' > Password' );

		context.primary = React.createElement( PasswordComponent, {
			userSettings: userSettings,
			path: context.path,
			accountPasswordData: accountPasswordData,
		} );
		next();
	},

	twoStep( context, next ) {
		const basePath = context.path;

		analytics.pageView.record( basePath, ANALYTICS_PAGE_TITLE + ' > Two-Step Authentication' );

		const TwoStepComponent = require( 'me/two-step' ).default;

		context.primary = React.createElement( TwoStepComponent, {
			userSettings: userSettings,
			path: context.path,
			appPasswordsData: appPasswordsData,
		} );
		next();
	},

	connectedApplications( context, next ) {
		const basePath = context.path;

		analytics.pageView.record( basePath, ANALYTICS_PAGE_TITLE + ' > Connected Applications' );

		context.primary = React.createElement( ConnectedAppsComponent, {
			userSettings: userSettings,
			path: context.path,
			connectedAppsData: connectedAppsData,
		} );
		next();
	},

	accountRecovery( context, next ) {
		const basePath = context.path;

		analytics.pageView.record( basePath, ANALYTICS_PAGE_TITLE + ' > Account Recovery' );

		context.primary = React.createElement( AccountRecoveryComponent, {
			userSettings: userSettings,
			path: basePath,
		} );
		next();
	},

	socialLogin( context, next ) {
		const basePath = context.path;

		analytics.pageView.record( basePath, ANALYTICS_PAGE_TITLE + ' > Social Login' );

		context.primary = React.createElement( SocialLoginComponent, {
			userSettings: userSettings,
			path: basePath,
		} );
		next();
	},
};
