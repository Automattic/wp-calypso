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
import notices from 'notices';
import userSettings from 'lib/user-settings';
import PasswordComponent from 'me/security/main';
import accountPasswordData from 'lib/account-password-data';
import SocialLoginComponent from 'me/social-login';
import ConnectedAppsComponent from 'me/connected-applications';
import connectedAppsData from 'lib/connected-applications-data';
import appPasswordsData from 'lib/application-passwords-data';
import AccountRecoveryComponent from 'me/security-account-recovery';

export default {
	password( context, next ) {
		if ( context.query && context.query.updated === 'password' ) {
			notices.success( i18n.translate( 'Your password was saved successfully.' ), {
				displayOnNextPage: true,
			} );

			page.replace( window.location.pathname );
		}

		context.primary = React.createElement( PasswordComponent, {
			userSettings: userSettings,
			path: context.path,
			accountPasswordData: accountPasswordData,
		} );
		next();
	},

	twoStep( context, next ) {
		const TwoStepComponent = require( 'me/two-step' ).default;

		context.primary = React.createElement( TwoStepComponent, {
			userSettings: userSettings,
			path: context.path,
			appPasswordsData: appPasswordsData,
		} );
		next();
	},

	connectedApplications( context, next ) {
		context.primary = React.createElement( ConnectedAppsComponent, {
			userSettings: userSettings,
			path: context.path,
			connectedAppsData: connectedAppsData,
		} );
		next();
	},

	accountRecovery( context, next ) {
		context.primary = React.createElement( AccountRecoveryComponent, {
			userSettings: userSettings,
			path: context.path,
		} );
		next();
	},

	socialLogin( context, next ) {
		context.primary = React.createElement( SocialLoginComponent, {
			userSettings: userSettings,
			path: context.path,
		} );
		next();
	},
};
