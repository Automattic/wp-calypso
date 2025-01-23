import page from '@automattic/calypso-router';
import { FormInputValidation, FormLabel } from '@automattic/components';
import { Spinner } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import FormsButton from 'calypso/components/forms/form-button';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { login } from 'calypso/lib/paths';
import { useDispatch } from 'calypso/state';
import { sendEmailLogin } from 'calypso/state/auth/actions';
const LostPasswordForm = ( {
	redirectToAfterLoginUrl,
	oauth2ClientId,
	locale,
	from,
	isWooJPC,
} ) => {
	const translate = useTranslate();
	const [ email, setEmail ] = useState( '' );
	const [ error, setError ] = useState( null );
	const [ isBusy, setBusy ] = useState( false );
	const dispatch = useDispatch();

	const validateEmail = () => {
		if ( email.length === 0 || email.includes( '@' ) ) {
			setError( null );
		} else {
			setError( translate( 'This email address is not valid. It must include a single @' ) );
		}
	};

	const getAuthAccountTypeRequest = async ( emailAddress ) => {
		const resp = await window.fetch(
			`https://public-api.wordpress.com/rest/v1.1/users/${ emailAddress }/auth-options`,
			{
				method: 'GET',
			}
		);
		if ( resp.status < 200 || resp.status >= 300 ) {
			throw resp;
		}
		return await resp.json();
	};

	const lostPasswordRequest = async () => {
		const formData = new FormData();
		formData.set( 'user_login', email );

		const origin = typeof window !== 'undefined' ? window.location.origin : '';
		const resp = await window.fetch( `${ origin }/wp-login.php?action=lostpassword`, {
			method: 'POST',
			body: formData,
			credentials: 'include',
		} );

		if ( resp.status < 200 || resp.status >= 300 ) {
			throw resp;
		}
		return await resp.text();
	};

	const onSubmit = async ( event ) => {
		event.preventDefault();

		if ( isWooJPC ) {
			const accountType = await getAuthAccountTypeRequest( email );
			if ( accountType?.passwordless === true ) {
				await dispatch(
					sendEmailLogin( email, {
						redirectTo: redirectToAfterLoginUrl,
						loginFormFlow: true,
						showGlobalNotices: true,
						flow: 'jetpack',
					} )
				);
				page(
					login( {
						isJetpack: true,
						// If no notification is sent, the user is using the authenticator for 2FA by default
						twoFactorAuthType: 'link',
						locale: locale,
						from: from,
						emailAddress: email,
					} )
				);
				return;
			}
		}

		try {
			setBusy( true );
			const result = await lostPasswordRequest();
			setBusy( false );
			if ( result.includes( 'Unable to reset password' ) ) {
				return setError(
					translate( "I'm sorry, but we weren't able to find a user with that login information." )
				);
			}

			page(
				login( {
					oauth2ClientId,
					locale,
					redirectTo: redirectToAfterLoginUrl,
					emailAddress: email,
					lostpasswordFlow: true,
					action: isWooJPC ? 'jetpack' : null,
					from,
				} )
			);
		} catch ( _httpError ) {
			setBusy( false );
			setError(
				translate( 'There was an error sending the password reset email. Please try again.' )
			);
		}
	};

	const showError = !! error;
	return (
		<form
			name="lostpasswordform"
			className="login__lostpassword-form"
			method="post"
			onSubmit={ onSubmit }
		>
			<div className="login__form-userdata">
				<FormLabel htmlFor="email">{ translate( 'Your email' ) }</FormLabel>
				<FormTextInput
					autoCapitalize="off"
					autoCorrect="off"
					spellCheck="false"
					autoComplete="email"
					id="email"
					name="email"
					type="email"
					value={ email }
					isError={ showError }
					onBlur={ validateEmail }
					onChange={ ( event ) => setEmail( event.target.value.trim() ) }
				/>
				{ showError && <FormInputValidation isError text={ error } /> }
			</div>
			<div className="login__form-action">
				<FormsButton primary type="submit" disabled={ email.length === 0 || showError || isBusy }>
					{ isBusy ? <Spinner /> : translate( 'Reset my password' ) }
				</FormsButton>
			</div>
		</form>
	);
};

export default LostPasswordForm;
