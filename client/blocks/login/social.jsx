import { Card } from '@automattic/components';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import SocialToS from 'calypso/blocks/authentication/social/social-tos.jsx';
import {
	GoogleSocialButton,
	AppleLoginButton,
	GithubSocialButton,
	MagicLoginButton,
	QrCodeLoginButton,
	UsernameOrEmailButton,
} from 'calypso/components/social-buttons';
import { useExperiment } from 'calypso/lib/explat';

import './social.scss';

const SOCIAL_LOGIN_EXPERIMENT = 'calypso_social_login_hide_apple_jetpack';

const SocialLoginForm = ( {
	handleLogin,
	trackLoginAndRememberRedirect,
	socialServiceResponse,
	shouldRenderToS = false,
	magicLoginLink,
	qrLoginLink,
	isSocialFirst,
	isWoo,
	lastUsedAuthenticationMethod,
	resetLastUsedAuthenticationMethod,
} ) => {
	const [ isLoading, experimentAssignment ] = useExperiment( SOCIAL_LOGIN_EXPERIMENT );
	const isTreatment = experimentAssignment?.variationName === 'treatment';
	const shouldShowApple = ! isLoading && ! isTreatment;

	const socialLoginButtons = [
		{
			service: 'google',
			button: (
				<GoogleSocialButton
					responseHandler={ handleLogin }
					onClick={ trackLoginAndRememberRedirect }
					key={ 1 }
					isLogin
				/>
			),
		},
		{
			service: 'apple',
			button: shouldShowApple && (
				<AppleLoginButton
					responseHandler={ handleLogin }
					onClick={ trackLoginAndRememberRedirect }
					socialServiceResponse={ socialServiceResponse }
					key={ 2 }
					isLogin
				/>
			),
		},
		{
			service: 'github',
			button: (
				<GithubSocialButton
					responseHandler={ handleLogin }
					onClick={ trackLoginAndRememberRedirect }
					socialServiceResponse={ socialServiceResponse }
					key={ 3 }
					isLogin
				/>
			),
		},
		{
			service: 'magic-login',
			button: ( isSocialFirst || isWoo ) && magicLoginLink && (
				<MagicLoginButton loginUrl={ magicLoginLink } key={ 4 } />
			),
		},
		{
			service: 'qr-code',
			button: ( isSocialFirst || isWoo ) && qrLoginLink && (
				<QrCodeLoginButton loginUrl={ qrLoginLink } key={ 5 } />
			),
		},
	];

	return (
		<Card
			className={ clsx( 'auth-form__social', 'is-login', { 'is-social-first': isSocialFirst } ) }
		>
			<div className="auth-form__social-buttons">
				<div className="auth-form__social-buttons-container">
					{ socialLoginButtons.map( ( { service, button }, index ) =>
						isSocialFirst && service === lastUsedAuthenticationMethod ? (
							<UsernameOrEmailButton
								key={ index + 1 }
								onClick={ resetLastUsedAuthenticationMethod }
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
};

SocialLoginForm.propTypes = {
	handleLogin: PropTypes.func.isRequired,
	trackLoginAndRememberRedirect: PropTypes.func.isRequired,
	socialServiceResponse: PropTypes.object,
	shouldRenderToS: PropTypes.bool,
	magicLoginLink: PropTypes.string,
	qrLoginLink: PropTypes.string,
	isSocialFirst: PropTypes.bool,
	isWoo: PropTypes.bool,
	lastUsedAuthenticationMethod: PropTypes.string,
	resetLastUsedAuthenticationMethod: PropTypes.func,
};

export default SocialLoginForm;
