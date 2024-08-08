import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import JetpackLogo from 'calypso/components/jetpack-logo';
import { useSelector, useDispatch } from 'calypso/state';
import { resetMagicLoginRequestForm } from 'calypso/state/login/magic-login/actions';
import { isFormDisabled } from 'calypso/state/login/selectors';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getIsWooPasswordless from 'calypso/state/selectors/get-is-woo-passwordless';

type QrCodeLoginButtonProps = {
	twoFactorAuthType: string;
	loginUrl: string;
};

const QrCodeLoginButton = ( { twoFactorAuthType, loginUrl }: QrCodeLoginButtonProps ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const { isDisabled, isJetpackWooCommerceFlow, oauth2Client, isWooPasswordless } = useSelector(
		( select ) => {
			return {
				isJetpackWooCommerceFlow:
					'woocommerce-onboarding' === getCurrentQueryArguments( select )?.from,
				oauth2Client: getCurrentOAuth2Client( select ) as { id: string },
				locale: getCurrentLocaleSlug( select ),
				isWooPasswordless: getIsWooPasswordless( select ),
				isDisabled: isFormDisabled( select ),
			};
		}
	);

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

	const handleClick = () => {
		recordTracksEvent( 'calypso_login_magic_login_request_click', {
			origin: 'login-links',
		} );

		dispatch( resetMagicLoginRequestForm() );
	};

	return (
		<Button
			className={ clsx( 'social-buttons__button button', { disabled: isDisabled } ) }
			href={ loginUrl }
			onClick={ handleClick }
			data-e2e-link="magic-login-link"
			key="lost-password-link"
		>
			<JetpackLogo monochrome={ isDisabled } size={ 20 } />
			<span className="social-buttons__service-name">{ translate( 'Login via app' ) }</span>
		</Button>
	);
};

export default QrCodeLoginButton;
