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
import { setDocumentHeadTitle as setTitle } from 'state/document-head/actions';

const ANALYTICS_PAGE_TITLE = 'Me';

export default {
	password(context, next) {
	    const PasswordComponent = require( 'me/security/main' );
		const basePath = context.path;
		const accountPasswordData = require( 'lib/account-password-data' );

		context.store.dispatch( setTitle( i18n.translate( 'Password', { textOnly: true } ) ) ); // FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.

		if ( context.query && context.query.updated === 'password' ) {
			notices.success( i18n.translate( 'Your password was saved successfully.' ), { displayOnNextPage: true } );

			page.replace( window.location.pathname );
		}

		analytics.pageView.record( basePath, ANALYTICS_PAGE_TITLE + ' > Password' );

		context.primary = React.createElement( PasswordComponent,
			{
				userSettings: userSettings,
				path: context.path,
				accountPasswordData: accountPasswordData
			}
		);
		next();
	},

	twoStep(context, next) {
	    const TwoStepComponent = require( 'me/two-step' ),
			basePath = context.path,
			appPasswordsData = require( 'lib/application-passwords-data' );

		context.store.dispatch( setTitle( i18n.translate( 'Two-Step Authentication', { textOnly: true } ) ) ); // FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.

		analytics.pageView.record( basePath, ANALYTICS_PAGE_TITLE + ' > Two-Step Authentication' );

		context.primary = React.createElement( TwoStepComponent,
			{
				userSettings: userSettings,
				path: context.path,
				appPasswordsData: appPasswordsData
			}
		);
		next();
	},

	connectedApplications(context, next) {
	    const ConnectedAppsComponent = require( 'me/connected-applications' ),
			basePath = context.path,
			connectedAppsData = require( 'lib/connected-applications-data' );

		context.store.dispatch( setTitle( i18n.translate( 'Connected Applications', { textOnly: true } ) ) ); // FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.

		analytics.pageView.record( basePath, ANALYTICS_PAGE_TITLE + ' > Connected Applications' );

		context.primary = React.createElement( ConnectedAppsComponent,
			{
				userSettings: userSettings,
				path: context.path,
				connectedAppsData: connectedAppsData
			}
		);
		next();
	},

	accountRecovery(context, next) {
	    const AccountRecoveryComponent = require( 'me/security-account-recovery' ),
			basePath = context.path;

		context.store.dispatch( setTitle( i18n.translate( 'Account Recovery', { textOnly: true } ) ) ); // FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.

		analytics.pageView.record( basePath, ANALYTICS_PAGE_TITLE + ' > Account Recovery' );

		context.primary = React.createElement( AccountRecoveryComponent,
			{
				userSettings: userSettings,
				path: context.path
			}
		);
		next();
	}
};
