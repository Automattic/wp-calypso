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
import titleActions from 'lib/screen-title/actions';
import { renderWithReduxStore } from 'lib/react-helpers';

const ANALYTICS_PAGE_TITLE = 'Me';

export default {
	password( context ) {
		const PasswordComponent = require( 'me/security/main' );
		const basePath = context.path;
		const accountPasswordData = require( 'lib/account-password-data' );

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
	}
};
