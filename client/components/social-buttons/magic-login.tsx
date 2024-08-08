import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import MailIcon from 'calypso/components/social-icons/mail';
import { canDoMagicLogin, getLoginLinkPageUrl } from 'calypso/lib/login';
import { useSelector, useDispatch } from 'calypso/state';
import { resetMagicLoginRequestForm } from 'calypso/state/login/magic-login/actions';
import { isFormDisabled } from 'calypso/state/login/selectors';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';

type MagicLoginButtonProps = {
	twoFactorAuthType: string;
	usernameOrEmail: string;
};

const MagicLoginButton = ( { twoFactorAuthType, usernameOrEmail }: MagicLoginButtonProps ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const { isDisabled, query, currentRoute, oauth2Client, locale } = useSelector( ( select ) => {
		return {
			isDisabled: isFormDisabled( select ),
			currentRoute: getCurrentRoute( select ),
			query: getCurrentQueryArguments( select ),
			oauth2Client: getCurrentOAuth2Client( select ) as { id: string },
			locale: getCurrentLocaleSlug( select ),
		};
	} );

	const isJetpackWooCommerceFlow = 'woocommerce-onboarding' === query?.from;

	const handleClick = () => {
		recordTracksEvent( 'calypso_login_magic_login_request_click', {
			origin: 'login-links',
		} );

		dispatch( resetMagicLoginRequestForm() );
	};

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

	const magicLoginPageLinkWithEmail = getMagicLoginPageLink();

	if ( ! magicLoginPageLinkWithEmail ) {
		return null;
	}

	return (
		<Button
			className={ clsx( 'social-buttons__button button', { disabled: isDisabled } ) }
			href={ magicLoginPageLinkWithEmail }
			onClick={ handleClick }
			data-e2e-link="magic-login-link"
			key="magic-login-link"
		>
			<MailIcon width="20" height="20" isDisabled={ isDisabled } />
			<span className="social-buttons__service-name">{ translate( 'Email me a login link' ) }</span>
		</Button>
	);
};

export default MagicLoginButton;
