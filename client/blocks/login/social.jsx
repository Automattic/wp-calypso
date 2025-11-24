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
import { isCIAB } from 'calypso/utils';

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

	socialLoginButtons = [
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
			enabled: () => config.isEnabled( 'sign-in-with-paypal' ) && isCIAB( 'paypal' ),
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
			enabled: true,
			button: this.props.isSocialFirst && this.props.magicLoginLink && (
				<MagicLoginButton
					loginUrl={ this.props.magicLoginLink }
					key="social-login-button-magic-login"
					isJetpack={ this.props.isJetpack }
				/>
			),
		},
		{
			service: 'qr-code',
			enabled: true,
			button: this.props.isSocialFirst && this.props.qrLoginLink && (
				<QrCodeLoginButton loginUrl={ this.props.qrLoginLink } key="social-login-button-qr-code" />
			),
		},
	];

	renderSocialButton( { service, enabled, button } ) {
		const { isSocialFirst, lastUsedAuthenticationMethod } = this.props;
		const isEnabled = typeof enabled === 'function' ? enabled() : enabled;

		if ( ! isEnabled ) {
			return null;
		}

		if ( isSocialFirst && service === lastUsedAuthenticationMethod ) {
			return (
				<UsernameOrEmailButton
					key="social-login-button-username-or-email"
					onClick={ this.props.resetLastUsedAuthenticationMethod }
				/>
			);
		}

		return button;
	}

	render() {
		const { isSocialFirst } = this.props;

		let buttons = this.socialLoginButtons;

		if ( isCIAB( 'paypal' ) ) {
			buttons = buttons.toSorted( ( a, b ) => {
				if ( a.service === 'paypal' ) {
					return -1;
				}
				if ( b.service === 'paypal' ) {
					return 1;
				}
				return 0;
			} );
		}

		return (
			<Card
				className={ clsx( 'auth-form__social', 'is-login', { 'is-social-first': isSocialFirst } ) }
			>
				<div className="auth-form__social-buttons">
					<div className="auth-form__social-buttons-container">
						{ buttons.map( this.renderSocialButton.bind( this ) ) }
					</div>
				</div>
			</Card>
		);
	}
}

export default SocialLoginForm;
