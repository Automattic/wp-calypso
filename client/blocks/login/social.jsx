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

class SocialLoginForm extends Component {
	static propTypes = {
		handleLogin: PropTypes.func.isRequired,
		trackLoginAndRememberRedirect: PropTypes.func.isRequired,
		socialServiceResponse: PropTypes.object,
		shouldRenderToS: PropTypes.bool,
		magicLoginLink: PropTypes.string,
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
			service: 'google',
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
			service: 'apple',
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
			service: 'github',
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
			service: 'magic-login',
			button: ( this.props.isSocialFirst || this.props.isWoo ) && this.props.magicLoginLink && (
				<MagicLoginButton loginUrl={ this.props.magicLoginLink } key={ 4 } />
			),
		},
		{
			service: 'qr-code',
			button: ( this.props.isSocialFirst || this.props.isWoo ) && this.props.qrLoginLink && (
				<QrCodeLoginButton loginUrl={ this.props.qrLoginLink } key={ 5 } />
			),
		},
	];

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
