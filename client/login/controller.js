/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import config from 'config';
import EmailedLoginLinkSuccessfully from './emailed-login-link-successfully';
import EmailedLoginLinkExpired from './emailed-login-link-expired';
import HandleEmailedLinkForm from './handle-emailed-link-form';
import Main from 'components/main';
import { renderWithReduxStore } from 'lib/react-helpers';
import RequestLoginEmailForm from './request-login-email-form';
import WPLogin from './wp-login';

export default {
	login: function( context ) {
		if ( config.isEnabled( 'wp-login' ) ) {
			renderWithReduxStore(
				<WPLogin />,
				'primary',
				context.store
			);
		}
	},

	magicLoginRequestEmailForm: function( context ) {
		renderWithReduxStore( (
				<Main className="login__magic-login-request-form">
					<RequestLoginEmailForm />
				</Main>
			),
			document.getElementById( 'primary' ),
			context.store
		);
	},

	magicLoginLinkWasSent: function( context ) {
		renderWithReduxStore( (
				<Main className="login__magic-link-was-sent">
					<EmailedLoginLinkSuccessfully />
				</Main>
			),
			document.getElementById( 'primary' ),
			context.store
		);
	},

	magicLoginClickHandler: function( context ) {
		renderWithReduxStore( (
				<Main className="login__magic-login-handle-click">
					<HandleEmailedLinkForm />
				</Main>
			),
			document.getElementById( 'primary' ),
			context.store
		);
	},

	magicLoginHasExpired: function( context ) {
		renderWithReduxStore( (
				<Main className="login__magic-link-exipred">
					<EmailedLoginLinkExpired />
				</Main>
			),
			document.getElementById( 'primary' ),
			context.store
		);
	}
};
