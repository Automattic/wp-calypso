/**
 * External dependencies
 */
import i18n from 'i18n-calypso';
import page from 'page';
import React from 'react';

/**
 * Internal dependencies
 */
import accountPasswordData from 'lib/account-password-data';
import analytics from 'lib/analytics';
import appPasswordsData from 'lib/application-passwords-data';
import connectedAppsData from 'lib/connected-applications-data';
import { renderWithReduxStore } from 'lib/react-helpers';
import userSettings from 'lib/user-settings';
import ConnectedAppsComponent from 'me/connected-applications';
import AccountRecoveryComponent from 'me/security-account-recovery';
import PasswordComponent from 'me/security/main';
import SocialLoginComponent from 'me/social-login';
import TwoStepComponent from 'me/two-step';
import notices from 'notices';

const ANALYTICS_PAGE_TITLE = 'Me';

export default {
	password( context ) {
	    const basePath = context.path;

		if ( context.query && context.query.updated === 'password' ) {
			notices.success( i18n.translate( 'Your password was saved successfully.' ), {
				displayOnNextPage: true,
			} );

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
		const basePath = context.path;

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
		const basePath = context.path;

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

	accountRecovery( context ) {
		const basePath = context.path;

		analytics.pageView.record( basePath, ANALYTICS_PAGE_TITLE + ' > Account Recovery' );

		renderWithReduxStore(
			React.createElement( AccountRecoveryComponent,
				{
					userSettings: userSettings,
					path: basePath
				}
			),
			document.getElementById( 'primary' ),
			context.store
		);
	},

	socialLogin( context ) {
	    const basePath = context.path;

		analytics.pageView.record( basePath, ANALYTICS_PAGE_TITLE + ' > Social Login' );

		renderWithReduxStore(
			React.createElement( SocialLoginComponent,
				{
					userSettings: userSettings,
					path: basePath
				}
			),
			document.getElementById( 'primary' ),
			context.store
		);
	},
};
