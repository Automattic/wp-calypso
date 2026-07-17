import { FormInputValidation, FormLabel } from '@automattic/components';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { login } from 'calypso/lib/paths';
import { useAccountRecoveryReset } from './use-account-recovery-reset';

type Step = 'username' | 'code' | 'new-password' | 'done';

const METHOD = 'secondary_email' as const;

/**
 * Minimal logged-out "recover via recovery email" flow. The user enters their
 * login, we look up the dedicated recovery email (`secondary_email`) configured
 * on the account, send a code to it, and validate the code they type back. This
 * covers the case the classic reset flow can't: the user has lost access to
 * their primary email, so a reset link sent there is useless.
 *
 * Note: the `account-recovery` endpoints verify identity so the user can reset
 * their password; there is no API to turn an email code alone into a signed-in
 * session. So once the code is verified we let the user set a new password and
 * then send them to the normal login page (where 2FA, if any, still applies).
 */
export default function RecoverViaEmailForm( { locale }: { locale?: string } ) {
	const translate = useTranslate();
	const { lookup, requestReset, validate, reset } = useAccountRecoveryReset();

	const [ step, setStep ] = useState< Step >( 'username' );
	const [ userLogin, setUserLogin ] = useState( '' );
	const [ code, setCode ] = useState( '' );
	const [ maskedEmail, setMaskedEmail ] = useState( '' );
	const [ password, setPassword ] = useState( '' );
	const [ error, setError ] = useState< string | null >( null );
	const [ isBusy, setIsBusy ] = useState( false );

	const onSubmitUsername = async ( event: React.FormEvent ) => {
		event.preventDefault();
		setError( null );
		setIsBusy( true );

		try {
			const methods = await lookup( { user: userLogin } );

			if ( ! methods.secondary_email ) {
				setError( translate( 'No recovery email is configured for this account.' ) );
				setIsBusy( false );
				return;
			}

			await requestReset( { userData: { user: userLogin }, method: METHOD } );

			setMaskedEmail( methods.secondary_email );
			setStep( 'code' );
		} catch {
			setError( translate( 'We couldn’t find an account or send a code. Please try again.' ) );
		}

		setIsBusy( false );
	};

	const onSubmitCode = async ( event: React.FormEvent ) => {
		event.preventDefault();
		setError( null );
		setIsBusy( true );

		try {
			await validate( { userData: { user: userLogin }, method: METHOD, key: code } );
			setStep( 'new-password' );
		} catch {
			setError( translate( 'That code is incorrect. Please try again.' ) );
		}

		setIsBusy( false );
	};

	const onSubmitNewPassword = async ( event: React.FormEvent ) => {
		event.preventDefault();
		setError( null );
		setIsBusy( true );

		try {
			await reset( { userData: { user: userLogin }, method: METHOD, key: code, password } );
			setStep( 'done' );
		} catch {
			setError( translate( 'We couldn’t reset your password. Please try again.' ) );
		}

		setIsBusy( false );
	};

	if ( step === 'done' ) {
		return (
			<div className="login__lostpassword-form">
				<p>{ translate( 'Your password has been reset. You can now log in with it.' ) }</p>
				<Button variant="primary" href={ login( { locale } ) } __next40pxDefaultSize>
					{ translate( 'Continue to log in' ) }
				</Button>
			</div>
		);
	}

	if ( step === 'new-password' ) {
		return (
			<form className="login__lostpassword-form" onSubmit={ onSubmitNewPassword }>
				<p>{ translate( 'Your recovery email has been verified. Set a new password.' ) }</p>
				<div className="login__form-userdata">
					<FormLabel htmlFor="newPassword">{ translate( 'New password' ) }</FormLabel>
					<FormTextInput
						id="newPassword"
						name="newPassword"
						type="password"
						autoComplete="new-password"
						value={ password }
						isError={ !! error }
						onChange={ ( event: React.ChangeEvent< HTMLInputElement > ) => {
							setPassword( event.target.value );
							setError( null );
						} }
					/>
					{ error && <FormInputValidation isError text={ error } /> }
				</div>
				<div className="login__form-action">
					<Button
						variant="primary"
						type="submit"
						disabled={ password.length === 0 || isBusy }
						isBusy={ isBusy }
						__next40pxDefaultSize
					>
						{ translate( 'Set new password' ) }
					</Button>
				</div>
			</form>
		);
	}

	if ( step === 'code' ) {
		return (
			<form className="login__lostpassword-form" onSubmit={ onSubmitCode }>
				<p>
					{ translate( 'We sent a code to %(email)s. Enter it below.', {
						args: { email: maskedEmail },
					} ) }
				</p>
				<div className="login__form-userdata">
					<FormLabel htmlFor="recoveryCode">{ translate( 'Verification code' ) }</FormLabel>
					<FormTextInput
						id="recoveryCode"
						name="recoveryCode"
						value={ code }
						isError={ !! error }
						onChange={ ( event: React.ChangeEvent< HTMLInputElement > ) => {
							setCode( event.target.value.trim() );
							setError( null );
						} }
					/>
					{ error && <FormInputValidation isError text={ error } /> }
				</div>
				<div className="login__form-action">
					<Button
						variant="primary"
						type="submit"
						disabled={ code.length === 0 || isBusy }
						isBusy={ isBusy }
						__next40pxDefaultSize
					>
						{ translate( 'Verify' ) }
					</Button>
				</div>
			</form>
		);
	}

	return (
		<form className="login__lostpassword-form" onSubmit={ onSubmitUsername }>
			<div className="login__form-userdata">
				<FormLabel htmlFor="userLogin">{ translate( 'Email address or username' ) }</FormLabel>
				<FormTextInput
					autoCapitalize="off"
					autoCorrect="off"
					spellCheck="false"
					autoComplete="username"
					id="userLogin"
					name="userLogin"
					value={ userLogin }
					isError={ !! error }
					onChange={ ( event: React.ChangeEvent< HTMLInputElement > ) => {
						setUserLogin( event.target.value.trim() );
						setError( null );
					} }
				/>
				{ error && <FormInputValidation isError text={ error } /> }
			</div>
			<div className="login__form-action">
				<Button
					variant="primary"
					type="submit"
					disabled={ userLogin.length === 0 || isBusy }
					isBusy={ isBusy }
					__next40pxDefaultSize
				>
					{ translate( 'Send code' ) }
				</Button>
			</div>
		</form>
	);
}
