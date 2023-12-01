import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import JetpackLogo from 'calypso/components/jetpack-logo';
import MailIcon from 'calypso/components/social-icons/mail';
import { canDoMagicLogin, getLoginLinkPageUrl } from 'calypso/lib/login';
import { login } from 'calypso/lib/paths';
import { addQueryArgs } from 'calypso/lib/url';
import { useSelector, useDispatch } from 'calypso/state';
import { resetMagicLoginRequestForm } from 'calypso/state/login/magic-login/actions';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';

interface LoginButtonsProps {
	locale: string;
	oauth2Client: object;
	twoFactorAuthType: string;
	usernameOrEmail: string;
}

const LoginButtons = ( {
	locale,
	oauth2Client,
	twoFactorAuthType,
	usernameOrEmail,
}: LoginButtonsProps ) => {
	const translate = useTranslate();

	const { query, wccomFrom, isJetpackWooCommerceFlow, currentRoute } = useSelector( ( state ) => {
		const query = getCurrentQueryArguments( state );

		return {
			query,
			wccomFrom: query?.[ 'wccom-from' ],
			isJetpackWooCommerceFlow: 'woocommerce-onboarding' === query?.from,
			currentRoute: getCurrentRoute( state ),
		};
	} );
	const dispatch = useDispatch();

	const getMagicLoginPageLink = () => {
		if (
			! canDoMagicLogin( twoFactorAuthType, oauth2Client, wccomFrom, isJetpackWooCommerceFlow )
		) {
			return null;
		}

		const loginLink = getLoginLinkPageUrl(
			locale,
			currentRoute,
			query?.signup_url,
			oauth2Client?.id
		);

		const emailAddress = usernameOrEmail || query?.email_address;

		return addQueryArgs( { email_address: emailAddress }, loginLink );
	};

	const handleMagicLoginClick = () => {
		recordTracksEvent( 'calypso_login_magic_login_request_click', {
			origin: 'login-links',
		} );
		dispatch( resetMagicLoginRequestForm() );
	};

	const renderMagicLoginButton = () => {
		const magicLoginPageLinkWithEmail = getMagicLoginPageLink();

		return (
			<Button
				className="social-buttons__button button"
				href={ magicLoginPageLinkWithEmail }
				onClick={ handleMagicLoginClick }
				data-e2e-link="magic-login-link"
				key="magic-login-link"
			>
				<MailIcon width="20" height="20" />
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
		if ( oauth2Client ) {
			return null;
		}

		if ( isJetpackWooCommerceFlow ) {
			return null;
		}

		const loginUrl = login( {
			locale: locale,
			twoFactorAuthType: 'qr',
			redirectTo: query?.redirect_to,
			signupUrl: query?.signup_url,
		} );

		return (
			<Button
				className="social-buttons__button button"
				href={ loginUrl }
				onClick={ handleMagicLoginClick }
				data-e2e-link="magic-login-link"
				key="lost-password-link"
			>
				<JetpackLogo size={ 20 } />
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
