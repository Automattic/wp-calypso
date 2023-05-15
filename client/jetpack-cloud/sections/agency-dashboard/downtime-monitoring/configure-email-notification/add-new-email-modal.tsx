import { Button } from '@automattic/components';
import { Modal } from '@wordpress/components';
import emailValidator from 'email-validator';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormTextInput from 'calypso/components/forms/form-text-input';

export default function AddNewEmailModal( { toggleModal }: { toggleModal: () => void } ) {
	const translate = useTranslate();

	const [ showCodeVerification, setShowCodeVerification ] = useState< boolean >( false );
	const [ validationError, setValidationError ] = useState< string >( '' );

	function onSave( event: React.FormEvent< HTMLFormElement > ) {
		event.preventDefault();
		setValidationError( '' );
		const { name, email, code } = (
			event.target as typeof event.target & {
				elements: { name: HTMLInputElement; email: HTMLInputElement; code?: HTMLInputElement };
			}
		 ).elements;
		if ( ! name.value ) {
			return setValidationError( translate( 'Please enter a name.' ) );
		}
		if ( ! email.value ) {
			return setValidationError( translate( 'Please enter an email address.' ) );
		}
		if ( ! emailValidator.validate( email.value ) ) {
			return setValidationError( translate( 'Please enter a valid email address.' ) );
		}
		if ( showCodeVerification ) {
			if ( ! code?.value ) {
				return setValidationError( translate( 'Please enter the verification code.' ) );
			}
			// TODO: verify email address with code
		} else {
			setShowCodeVerification( true );
			// TODO: implement sending verification code
		}
	}

	function handleResendCode() {
		// TODO: implement resending verification code
	}

	return (
		<Modal
			open={ true }
			onRequestClose={ toggleModal }
			title={ translate( 'Add your email address' ) }
			className="notification-settings__modal"
		>
			<div className="notification-settings__sub-title">
				{ translate( 'Please use only your number or one you have access to. ' ) }
			</div>

			<form className="configure-email-notification__form" onSubmit={ onSave }>
				<FormFieldset>
					<FormLabel htmlFor="name">{ translate( 'Name' ) }</FormLabel>
					<FormTextInput id="name" name="name" disabled={ showCodeVerification } />
					<div className="configure-email-notification__help-text">
						{ translate( 'Give this email a nickname for your personal reference' ) }
					</div>
				</FormFieldset>

				<FormFieldset>
					<FormLabel htmlFor="email">{ translate( 'Email' ) }</FormLabel>
					<FormTextInput id="email" name="email" disabled={ showCodeVerification } />
					<div className="configure-email-notification__help-text">
						{ translate( 'We’ll send a code to verify your email address.' ) }
					</div>
				</FormFieldset>

				{ showCodeVerification && (
					<FormFieldset>
						<FormLabel htmlFor="code">
							{ translate( 'Please enter the code you received via email' ) }
						</FormLabel>
						<FormTextInput id="code" name="code" />
						<div className="configure-email-notification__help-text">
							{ translate(
								'Please wait for a minute. If you didn’t receive it, we can {{button}}resend{{/button}} it.',
								{
									components: {
										button: (
											<Button
												className="configure-email-notification__resend-code-button"
												borderless
												onClick={ handleResendCode }
												aria-label={ translate( 'Resend Code' ) }
											/>
										),
									},
								}
							) }
						</div>
					</FormFieldset>
				) }
				<div className="notification-settings__footer">
					{ validationError && (
						<div className="notification-settings__footer-validation-error">
							{ validationError }
						</div>
					) }
					<div className="notification-settings__footer-buttons">
						<Button onClick={ toggleModal } aria-label={ translate( 'Cancel' ) }>
							{ showCodeVerification ? translate( 'Later' ) : translate( 'Cancel' ) }
						</Button>
						<Button disabled={ false } type="submit" primary aria-label={ translate( 'Verify' ) }>
							{ translate( 'Verify' ) }
						</Button>
					</div>
				</div>
			</form>
		</Modal>
	);
}
