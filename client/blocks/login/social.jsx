import { Card } from '@automattic/components';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Component } from 'react';
import SocialToS from 'calypso/blocks/authentication/social/social-tos.jsx';
import {
	GoogleSocialButton,
	AppleLoginButton,
	GithubSocialButton,
	MagicLoginButton,
	QrCodeLoginButton,
	UsernameOrEmailButton,
} from 'calypso/components/social-buttons';

import './social.scss';

const SERVICE_NAME_GOOGLE = 'google';
const SERVICE_NAME_APPLE = 'apple';
const SERVICE_NAME_GITHUB = 'github';
const SERVICE_NAME_MAGIC_LOGIN = 'magic-login';
const SERVICE_NAME_QR_CODE = 'qr-code';

class SocialLoginForm extends Component {
	static propTypes = {
		handleLogin: PropTypes.func.isRequired,
		trackLoginAndRememberRedirect: PropTypes.func.isRequired,
		socialServiceResponse: PropTypes.object,
		shouldRenderToS: PropTypes.bool,
		magicLoginLink: PropTypes.string,
		magicLoginButtonText: PropTypes.string,
		isMagicLoginOnly: PropTypes.bool,
		qrLoginLink: PropTypes.string,
		isSocialFirst: PropTypes.bool,
		lastUsedAuthenticationMethod: PropTypes.string,
		resetLastUsedAuthenticationMethod: PropTypes.func,
	};

	static defaultProps = {
		shouldRenderToS: false,
	};

	socialLoginButtons = [
		{
			service: SERVICE_NAME_GOOGLE,
			button: (
				<GoogleSocialButton
					responseHandler={ this.props.handleLogin }
					onClick={ this.props.trackLoginAndRememberRedirect }
					key={ 1 }
					isLogin
				/>
			),
		},
		{
			service: SERVICE_NAME_APPLE,
			button: (
				<AppleLoginButton
					responseHandler={ this.props.handleLogin }
					onClick={ this.props.trackLoginAndRememberRedirect }
					socialServiceResponse={ this.props.socialServiceResponse }
					key={ 2 }
					isLogin
				/>
			),
		},
		{
			service: SERVICE_NAME_GITHUB,
			button: (
				<GithubSocialButton
					responseHandler={ this.props.handleLogin }
					onClick={ this.props.trackLoginAndRememberRedirect }
					socialServiceResponse={ this.props.socialServiceResponse }
					key={ 3 }
					isLogin
				/>
			),
		},
		{
			service: SERVICE_NAME_MAGIC_LOGIN,
			button: ( this.props.isSocialFirst || this.props.isWoo ) && this.props.magicLoginLink && (
				<MagicLoginButton
					loginUrl={ this.props.magicLoginLink }
					buttonText={ this.props.magicLoginButtonText }
					key={ 4 }
				/>
			),
		},
		{
			service: SERVICE_NAME_QR_CODE,
			button: ( this.props.isSocialFirst || this.props.isWoo ) && this.props.qrLoginLink && (
				<QrCodeLoginButton loginUrl={ this.props.qrLoginLink } key={ 5 } />
			),
		},
	].filter( ( { service } ) =>
		this.props.isMagicLoginOnly ? service === SERVICE_NAME_MAGIC_LOGIN : true
	);

	render() {
		const { shouldRenderToS, isWoo, isSocialFirst, lastUsedAuthenticationMethod } = this.props;

		return (
			<Card
				className={ clsx( 'auth-form__social', 'is-login', { 'is-social-first': isSocialFirst } ) }
			>
				<div className="auth-form__social-buttons">
					<div className="auth-form__social-buttons-container">
						{ this.socialLoginButtons.map( ( { service, button }, index ) =>
							isSocialFirst && service === lastUsedAuthenticationMethod ? (
								<UsernameOrEmailButton
									key={ index + 1 }
									onClick={ this.props.resetLastUsedAuthenticationMethod }
								/>
							) : (
								button
							)
						) }
					</div>
					{ ! isWoo && shouldRenderToS && <SocialToS /> }
				</div>
				{ isWoo && shouldRenderToS && <SocialToS /> }
			</Card>
		);
	}
}

export default SocialLoginForm;
