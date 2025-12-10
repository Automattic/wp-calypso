import config from '@automattic/calypso-config';
import { Card } from '@automattic/components';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Component } from 'react';
import {
	GoogleSocialButton,
	AppleLoginButton,
	GithubSocialButton,
	PayPalSocialButton,
	MagicLoginButton,
	QrCodeLoginButton,
	UsernameOrEmailButton,
} from 'calypso/components/social-buttons';
import { isCIAB, sortLoginButtons } from 'calypso/utils';

import './social.scss';

class SocialLoginForm extends Component {
	static propTypes = {
		handleLogin: PropTypes.func.isRequired,
		trackLoginAndRememberRedirect: PropTypes.func.isRequired,
		socialServiceResponse: PropTypes.object,
		magicLoginLink: PropTypes.string,
		qrLoginLink: PropTypes.string,
		isSocialFirst: PropTypes.bool,
		lastUsedAuthenticationMethod: PropTypes.string,
		resetLastUsedAuthenticationMethod: PropTypes.func,
		isJetpack: PropTypes.bool,
	};

	render() {
		const { isSocialFirst, lastUsedAuthenticationMethod } = this.props;

		let buttons = [
			{
				service: 'google',
				enabled: true,
				button: (
					<GoogleSocialButton
						responseHandler={ this.props.handleLogin }
						onClick={ this.props.trackLoginAndRememberRedirect }
						key="social-login-button-google"
						isLogin
					/>
				),
			},
			{
				service: 'apple',
				enabled: true,
				button: (
					<AppleLoginButton
						responseHandler={ this.props.handleLogin }
						onClick={ this.props.trackLoginAndRememberRedirect }
						socialServiceResponse={ this.props.socialServiceResponse }
						key="social-login-button-apple"
						isLogin
					/>
				),
			},
			{
				service: 'github',
				enabled: true,
				button: (
					<GithubSocialButton
						responseHandler={ this.props.handleLogin }
						onClick={ this.props.trackLoginAndRememberRedirect }
						socialServiceResponse={ this.props.socialServiceResponse }
						key="social-login-button-github"
						isLogin
					/>
				),
			},
			{
				service: 'paypal',
				enabled: config.isEnabled( 'sign-in-with-paypal' ) && isCIAB( 'paypal' ),
				button: (
					<PayPalSocialButton
						responseHandler={ this.props.handleLogin }
						onClick={ this.props.trackLoginAndRememberRedirect }
						socialServiceResponse={ this.props.socialServiceResponse }
						key="social-login-button-paypal"
						isLogin
					/>
				),
			},
			{
				service: 'magic-login',
				enabled: this.props.isSocialFirst && this.props.magicLoginLink,
				button: (
					<MagicLoginButton
						loginUrl={ this.props.magicLoginLink }
						key="social-login-button-magic-login"
						isJetpack={ this.props.isJetpack }
					/>
				),
			},
			{
				service: 'qr-code',
				enabled: this.props.isSocialFirst && this.props.qrLoginLink,
				button: (
					<QrCodeLoginButton
						loginUrl={ this.props.qrLoginLink }
						key="social-login-button-qr-code"
					/>
				),
			},
		];

		const usernameOrEmailButton = {
			service: 'username-or-email',
			enabled: true,
			button: (
				<UsernameOrEmailButton
					key="social-login-button-username-or-email"
					onClick={ this.props.resetLastUsedAuthenticationMethod }
				/>
			),
		};

		buttons = sortLoginButtons( buttons.filter( ( button ) => button.enabled ) );

		// Some login options may be present only in certain flows (e.g. PayPal), so if the last used
		// one is only shown conditionally, the username option will need to be appended as it
		// cannot replace the last used one.
		if ( lastUsedAuthenticationMethod ) {
			const lastUsedButtonIndex = buttons.findIndex(
				( button ) => button.service === lastUsedAuthenticationMethod
			);

			if ( lastUsedButtonIndex > -1 ) {
				buttons[ lastUsedButtonIndex ] = usernameOrEmailButton;
			} else {
				buttons.push( usernameOrEmailButton );
			}
		}

		return (
			<Card
				className={ clsx( 'auth-form__social', 'is-login', { 'is-social-first': isSocialFirst } ) }
			>
				<div className="auth-form__social-buttons">
					<div className="auth-form__social-buttons-container">
						{ buttons.map( ( item ) => item.button ) }
					</div>
				</div>
			</Card>
		);
	}
}

export default SocialLoginForm;
