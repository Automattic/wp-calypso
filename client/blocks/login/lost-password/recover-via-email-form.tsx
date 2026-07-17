import { FormInputValidation, FormLabel } from '@automattic/components';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { useAccountRecoveryReset } from './use-account-recovery-reset';

type Step = 'username' | 'sent';

const METHOD = 'secondary_email' as const;

/**
 * Minimal logged-out "recover via recovery email" flow. The user enters their
 * login, we look up the dedicated recovery email (`secondary_email`) configured
 * on the account, and send a password-reset link to it. This covers the case
 * the classic reset flow can't: the user has lost access to their primary email,
 * so a reset link sent there is useless.
 *
 * The reset link points at WordPress core's reset page (`wp-login.php?action=rp`),
 * which validates the key and lets the user set a new password. So this form
 * ends once the email is sent; there is no code to enter or password to set here.
 */
export default function RecoverViaEmailForm() {
	const translate = useTranslate();
	const { lookup, requestReset } = useAccountRecoveryReset();

	const [ step, setStep ] = useState< Step >( 'username' );
	const [ userLogin, setUserLogin ] = useState( '' );
	const [ maskedEmail, setMaskedEmail ] = useState( '' );
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
			setStep( 'sent' );
		} catch {
			setError(
				translate( 'We couldn’t find an account or send a reset link. Please try again.' )
			);
		}

		setIsBusy( false );
	};

	if ( step === 'sent' ) {
		return (
			<div className="login__lostpassword-form">
				<p>
					{ translate(
						'We sent a password reset link to %(email)s. Click it to finish resetting your password.',
						{ args: { email: maskedEmail } }
					) }
				</p>
			</div>
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
					{ translate( 'Send reset link' ) }
				</Button>
			</div>
		</form>
	);
}
