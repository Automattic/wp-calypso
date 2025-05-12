import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import MailIcon from 'calypso/components/social-icons/mail';
import { useSelector, useDispatch } from 'calypso/state';
import { resetMagicLoginRequestForm } from 'calypso/state/login/magic-login/actions';
import { isFormDisabled } from 'calypso/state/login/selectors';

import '@automattic/components/styles/wp-button-override.scss';
import './style.scss';

type MagicLoginButtonProps = {
	loginUrl: string;
};

export const MagicLoginButton = ( { loginUrl }: MagicLoginButtonProps ) => {
	const translate = useTranslate();
	const isDisabled = useSelector( isFormDisabled );
	const dispatch = useDispatch();

	const handleClick = () => {
		recordTracksEvent( 'calypso_login_magic_login_request_click', {
			origin: 'login-links',
		} );

		dispatch( resetMagicLoginRequestForm() );
	};

	return (
		<Button
			className={ clsx( 'a8c-components-wp-button social-buttons__button magic-login-link', {
				disabled: isDisabled,
			} ) }
			href={ loginUrl }
			onClick={ handleClick }
			data-e2e-link="magic-login-link"
			key="magic-login-link"
			variant="secondary"
			__next40pxDefaultSize
		>
			<MailIcon width="20" height="20" isDisabled={ isDisabled } />
			<span className="social-buttons__service-name">{ translate( 'Email me a login link' ) }</span>
		</Button>
	);
};

export default MagicLoginButton;
