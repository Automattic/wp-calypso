import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import JetpackLogo from 'calypso/components/jetpack-logo';
import MailIcon from 'calypso/components/social-icons/mail';
import { canDoMagicLogin, getLoginLinkPageUrl } from 'calypso/lib/login';
import { login } from 'calypso/lib/paths';
import { useSelector, useDispatch } from 'calypso/state';
import { resetMagicLoginRequestForm } from 'calypso/state/login/magic-login/actions';
import { isFormDisabled } from 'calypso/state/login/selectors';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';

interface LoginButtonsProps {
	locale: string;
	oauth2Client: {
		id: string;
	};
	twoFactorAuthType: string;
	usernameOrEmail: string;
	isWooPasswordless: boolean;
}

const LoginButtons = ( {
	locale,
	oauth2Client,
	twoFactorAuthType,
	usernameOrEmail,
	isWooPasswordless,
}: LoginButtonsProps ) => {
	const translate = useTranslate();
	const query = useSelector( getCurrentQueryArguments );
	const isJetpackWooCommerceFlow = 'woocommerce-onboarding' === query?.from;
	const currentRoute = useSelector( getCurrentRoute );
	const isDisabled = useSelector( isFormDisabled );
	const dispatch = useDispatch();

	const getMagicLoginPageLink = () => {
		if ( ! canDoMagicLogin( twoFactorAuthType, oauth2Client, isJetpackWooCommerceFlow ) ) {
			return null;
		}

		const loginLink = getLoginLinkPageUrl( {
			locale,
			currentRoute,
			signupUrl: query?.signup_url,
			oauth2ClientId: oauth2Client?.id,
			emailAddress: usernameOrEmail || query?.email_address,
			redirectTo: query?.redirect_to,
		} );

		return loginLink;
	};

	const handleMagicLoginClick = () => {
		recordTracksEvent( 'calypso_login_magic_login_request_click', {
			origin: 'login-links',
		} );
		dispatch( resetMagicLoginRequestForm() );
	};

	const renderMagicLoginButton = () => {
		const magicLoginPageLinkWithEmail = getMagicLoginPageLink();

		if ( ! magicLoginPageLinkWithEmail ) {
			return null;
		}

		return (
			<Button
				className={ clsx( 'social-buttons__button button', { disabled: isDisabled } ) }
				href={ magicLoginPageLinkWithEmail }
				onClick={ handleMagicLoginClick }
				data-e2e-link="magic-login-link"
				key="magic-login-link"
			>
				<MailIcon width="20" height="20" isDisabled={ isDisabled } />
				<span className="social-buttons__service-name">
					{ translate( 'Email me a login link' ) }
				</span>
			</Button>
		);
	};

	const renderQrCodeLoginLink = () => {
		if ( twoFactorAuthType ) {
			return null;
		}
		// Is not supported for any oauth 2 client.
		// n.b this seems to work for woo.com so it's not clear why the above comment is here
		if ( oauth2Client && ! isWooPasswordless ) {
			return null;
		}

		if ( isJetpackWooCommerceFlow ) {
			return null;
		}

		const loginUrl = login( {
			locale: locale,
			twoFactorAuthType: 'qr',
			redirectTo: query?.redirect_to as string,
			signupUrl: query?.signup_url as string,
		} );

		return (
			<Button
				className={ clsx( 'social-buttons__button button', { disabled: isDisabled } ) }
				href={ loginUrl }
				onClick={ handleMagicLoginClick }
				data-e2e-link="magic-login-link"
				key="lost-password-link"
			>
				<JetpackLogo monochrome={ isDisabled } size={ 20 } />
				<span className="social-buttons__service-name">{ translate( 'Login via app' ) }</span>
			</Button>
		);
	};

	return (
		<>
			{ renderMagicLoginButton() }
			{ renderQrCodeLoginLink() }
		</>
	);
};

export default LoginButtons;
