/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import userSettings from 'calypso/lib/user-settings';
import PasswordComponent from 'calypso/me/security/main';
import accountPasswordData from 'calypso/lib/account-password-data';
import SocialLoginComponent from 'calypso/me/social-login';
import ConnectedAppsComponent from 'calypso/me/connected-applications';
import AccountRecoveryComponent from 'calypso/me/security-account-recovery';
import SecurityCheckupComponent from 'calypso/me/security-checkup';
import { getSocialServiceFromClientId } from 'calypso/lib/login';
import { successNotice } from 'calypso/state/notices/actions';

export function password( context, next ) {
	if ( context.query && context.query.updated === 'password' ) {
		context.store.dispatch(
			successNotice( i18n.translate( 'Your password was saved successfully.' ), {
				displayOnNextPage: true,
			} )
		);

		page.replace( window.location.pathname );
	}

	context.primary = React.createElement( PasswordComponent, {
		userSettings: userSettings,
		path: context.path,
		accountPasswordData: accountPasswordData,
	} );
	next();
}

export function twoStep( context, next ) {
	const TwoStepComponent = require( 'calypso/me/two-step' ).default;

	context.primary = React.createElement( TwoStepComponent, {
		userSettings: userSettings,
		path: context.path,
	} );
	next();
}

export function connectedApplications( context, next ) {
	context.primary = React.createElement( ConnectedAppsComponent, {
		path: context.path,
	} );
	next();
}

export function accountRecovery( context, next ) {
	context.primary = React.createElement( AccountRecoveryComponent, {
		path: context.path,
	} );
	next();
}

export function securityCheckup( context, next ) {
	context.primary = React.createElement( SecurityCheckupComponent, {
		path: context.path,
	} );
	next();
}

export function socialLogin( context, next ) {
	// Remove id_token from the address bar and push social connect args into the state instead
	if ( context.hash && context.hash.client_id ) {
		page.replace( context.path, context.hash );
		return;
	}

	const previousHash = context.state || {};
	const { client_id, user_email, user_name, id_token, state } = previousHash;
	const socialServiceResponse = client_id
		? { client_id, user_email, user_name, id_token, state }
		: null;
	const socialService = getSocialServiceFromClientId( client_id );

	context.primary = React.createElement( SocialLoginComponent, {
		path: context.path,
		socialService,
		socialServiceResponse,
	} );
	next();
}
