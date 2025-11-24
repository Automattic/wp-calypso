import page from '@automattic/calypso-router';
import { FormInputValidation, FormLabel } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { Button, Spinner, ExternalLink } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState, useRef, useEffect } from 'react';
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
	isWoo,
	isJetpack,
} ) => {
	const translate = useTranslate();
	const [ userLogin, setUserLogin ] = useState( '' );
	const [ error, setError ] = useState( null );
	const [ isBusy, setBusy ] = useState( false );
	const dispatch = useDispatch();

	const inputRef = useRef( null );
	useEffect( () => {
		inputRef.current?.focus();
	}, [] );

	const validateUserLogin = () => {
		// Allow empty input or any non-empty value (username or email)
		if ( userLogin.length === 0 ) {
			setError( null );
		} else if ( userLogin.includes( '@' ) ) {
			// If it contains @, validate as email
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if ( emailRegex.test( userLogin ) ) {
				setError( null );
			} else {
				setError( translate( 'Please enter a valid email address.' ) );
			}
		} else {
			// Username - accept any non-empty value
			setError( null );
		}
	};

	const getAuthAccountTypeRequest = async ( userNameOrEmail ) => {
		const resp = await window.fetch(
			`https://public-api.wordpress.com/rest/v1.1/users/${ userNameOrEmail }/auth-options`,
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
		formData.set( 'user_login', userLogin );

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
			const accountType = await getAuthAccountTypeRequest( userLogin );
			if ( accountType?.passwordless === true ) {
				await dispatch(
					sendEmailLogin( userLogin, {
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
						emailAddress: userLogin,
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
					emailAddress: userLogin,
					lostpasswordFlow: true,
					from,
					isJetpack: isWooJPC || isJetpack,
				} )
			);
		} catch ( response ) {
			setBusy( false );
			const defaultError = translate(
				'There was an error sending the password reset email. Please try again.'
			);

			/**
			 * Check this is a network error first, so that we can run
			 * Response.text() on it.
			 */
			if ( ! response?.text ) {
				return setError( defaultError );
			}

			const result = await response.text();

			/**
			 * Check if DOMParser is available, in case it's missing in the
			 * server-side rendering context.
			 */
			if ( typeof DOMParser === 'undefined' ) {
				return setError( defaultError );
			}

			const parser = new DOMParser();
			const resultHTML = parser.parseFromString( result, 'text/html' );

			const wpDieMessage = resultHTML.querySelector( '.wp-die-message' );
			if ( wpDieMessage ) {
				return setError( wpDieMessage.textContent.trim() );
			}

			return setError( defaultError );
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
				<FormLabel htmlFor="userLogin">{ translate( 'Email address or username' ) }</FormLabel>
				<FormTextInput
					autoCapitalize="off"
					autoCorrect="off"
					spellCheck="false"
					autoComplete="username"
					id="userLogin"
					name="userLogin"
					type="text"
					value={ userLogin }
					isError={ showError }
					onBlur={ validateUserLogin }
					onChange={ ( event ) => {
						const newValue = event.target.value.trim();
						setUserLogin( newValue );
						// Clear error immediately when user starts typing to fix input
						if ( error ) {
							setError( null );
						}
					} }
					ref={ inputRef }
				/>
				{ showError && <FormInputValidation isError text={ error } /> }
				<ExternalLink
					href={ localizeUrl(
						'https://wordpress.com/support/account-recovery/#verify-your-account-ownership',
						locale
					) }
				>
					{ translate( 'Need more help?' ) }
				</ExternalLink>
			</div>
			<div className="login__form-action">
				<Button
					variant="primary"
					type="submit"
					disabled={ userLogin.length === 0 || showError || isBusy }
					isBusy={ isBusy }
					__next40pxDefaultSize
				>
					{ isBusy && isWoo ? <Spinner /> : translate( 'Reset my password' ) }
				</Button>
			</div>
		</form>
	);
};

export default LostPasswordForm;
