import page from '@automattic/calypso-router';
import { localizeUrl } from '@automattic/i18n-utils';
import { ExternalLink } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { PrimaryButton, Screen, TextField } from 'calypso/blocks/authentication';
import { login } from 'calypso/lib/paths';
import { useDispatch } from 'calypso/state';
import { sendEmailLogin } from 'calypso/state/auth/actions';

const LostPasswordForm = ( {
	redirectToAfterLoginUrl,
	oauth2ClientId,
	locale,
	from,
	isWooJPC,
	isJetpack,
} ) => {
	const translate = useTranslate();
	const [ userLogin, setUserLogin ] = useState( '' );
	const [ error, setError ] = useState( null );
	const [ isBusy, setBusy ] = useState( false );
	const dispatch = useDispatch();

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
		<Screen
			heading={ translate( 'Lost your password?' ) }
			subheading={ translate(
				"Please enter your username or email address. You'll receive a link to create a new password via email."
			) }
		>
			<form
				name="lostpasswordform"
				className="login__lostpassword-form"
				method="post"
				onSubmit={ onSubmit }
			>
				<div className="login__form-userdata">
					<TextField
						label={ translate( 'Email address or username' ) }
						value={ userLogin }
						onChange={ ( newValue ) => {
							const trimmed = newValue.trim();
							setUserLogin( trimmed );
							// Clear error immediately when user starts typing to fix input
							if ( error ) {
								setError( null );
							}
						} }
						onBlur={ validateUserLogin }
						type="text"
						autoComplete="username"
						autoCapitalize="off"
						autoCorrect="off"
						spellCheck="false"
						autoFocus // eslint-disable-line jsx-a11y/no-autofocus
					/>
					{ showError && (
						<p className="login__lostpassword-error" role="alert">
							{ error }
						</p>
					) }
				</div>
				<div className="login__form-action">
					<PrimaryButton
						type="submit"
						disabled={ userLogin.length === 0 || showError || isBusy }
						isBusy={ isBusy }
					>
						{ translate( 'Reset my password' ) }
					</PrimaryButton>
				</div>
				<div className="login__form-help">
					<ExternalLink
						href={ localizeUrl(
							'https://wordpress.com/support/account-recovery/#verify-your-account-ownership',
							locale
						) }
					>
						{ translate( 'Need more help?' ) }
					</ExternalLink>
				</div>
			</form>
		</Screen>
	);
};

export default LostPasswordForm;
