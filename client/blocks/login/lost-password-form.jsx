import { FormInputValidation } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useState } from 'react';
import FormsButton from 'calypso/components/forms/form-button';
import FormLabel from 'calypso/components/forms/form-label';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { login } from 'calypso/lib/paths';

const LostPasswordForm = ( { redirectToAfterLoginUrl, oauth2ClientId, locale } ) => {
	const translate = useTranslate();
	const [ email, setEmail ] = useState( '' );
	const [ error, setError ] = useState( null );

	const validateEmail = () => {
		if ( email.length === 0 || email.includes( '@' ) ) {
			setError( null );
		} else {
			setError( translate( 'This email address is not valid. It must include a single @' ) );
		}
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

		try {
			const result = await lostPasswordRequest();
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
				} )
			);
		} catch ( _httpError ) {
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
				<FormLabel htmlFor="email">{ translate( 'Your email address' ) }</FormLabel>
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
				<FormsButton primary type="submit" disabled={ email.length === 0 || showError }>
					{ translate( 'Reset my password' ) }
				</FormsButton>
			</div>
		</form>
	);
};

export default LostPasswordForm;
