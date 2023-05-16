import { Button } from '@automattic/components';
import { Modal } from '@wordpress/components';
import emailValidator from 'email-validator';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useState } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormTextInput from 'calypso/components/forms/form-text-input';
import type {
	MonitorSettingsEmail,
	AllowedMonitorContactActions,
} from '../../sites-overview/types';
interface StateEmailItem extends MonitorSettingsEmail {
	checked: boolean;
	isDefault?: boolean;
}

interface Props {
	toggleModal: () => void;
	selectedEmail?: StateEmailItem;
	selectedAction?: AllowedMonitorContactActions;
}

export default function EmailAddressEditor( {
	toggleModal,
	selectedEmail,
	selectedAction = 'add',
}: Props ) {
	const translate = useTranslate();

	const [ showCodeVerification, setShowCodeVerification ] = useState< boolean >( false );
	const [ validationError, setValidationError ] = useState<
		{ email?: string; code?: string } | undefined
	>( {} );
	const [ emailItem, setEmailItem ] = useState< { name: string; email: string; code?: string } >( {
		name: '',
		email: '',
		code: '',
	} );

	const isVerifyAction = selectedAction === 'verify';
	const isEditAction = selectedAction === 'edit';

	useEffect( () => {
		if ( isVerifyAction ) {
			setShowCodeVerification( true );
		}
	}, [ isVerifyAction ] );

	useEffect( () => {
		if ( selectedEmail ) {
			setEmailItem( { name: selectedEmail.name, email: selectedEmail.email } );
		}
	}, [ selectedEmail ] );

	const onSave = ( event: React.FormEvent< HTMLFormElement > ) => {
		event.preventDefault();
		setValidationError( undefined );
		if ( ! emailValidator.validate( emailItem.email ) ) {
			return setValidationError( { email: translate( 'Please enter a valid email address.' ) } );
		}
		if ( showCodeVerification ) {
			// TODO: verify email address with code
		} else {
			setShowCodeVerification( true );
			// TODO: implement sending verification code
		}
	};

	let title = translate( 'Add new email address' );
	let subTitle = translate( 'Please use only your number or one you have access to.' );

	if ( isVerifyAction ) {
		title = translate( 'Verify your email address' );
		subTitle = translate( 'We’ll send a code to verify your email address.' );
	}

	if ( isEditAction ) {
		title = translate( 'Edit your email address' );
		subTitle = translate( 'If you update your email address, you’ll need to verify it.' );
	}

	const handleResendCode = () => {
		// TODO: implement resending verification code
	};

	const handleChange = useCallback(
		( key ) => ( event: React.ChangeEvent< HTMLInputElement > ) => {
			setEmailItem( ( prevState ) => ( { ...prevState, [ key ]: event.target.value } ) );
		},
		[]
	);

	return (
		<Modal
			open={ true }
			onRequestClose={ toggleModal }
			title={ title }
			className="notification-settings__modal"
		>
			<div className="notification-settings__sub-title">{ subTitle }</div>

			<form className="configure-email-notification__form" onSubmit={ onSave }>
				<FormFieldset>
					<FormLabel htmlFor="name">{ translate( 'Name' ) }</FormLabel>
					<FormTextInput
						id="name"
						name="name"
						value={ emailItem.name }
						disabled={ showCodeVerification }
						onChange={ handleChange( 'name' ) }
					/>
					{ ! isVerifyAction && (
						<div className="configure-email-notification__help-text">
							{ translate( 'Give this email a nickname for your personal reference' ) }
						</div>
					) }
				</FormFieldset>

				<FormFieldset>
					<FormLabel htmlFor="email">{ translate( 'Email' ) }</FormLabel>
					<FormTextInput
						id="email"
						name="email"
						value={ emailItem.email }
						disabled={ showCodeVerification }
						onChange={ handleChange( 'email' ) }
					/>
					{ validationError?.email && (
						<div className="notification-settings__footer-validation-error">
							{ validationError.email }
						</div>
					) }
					{ ! isVerifyAction && (
						<div className="configure-email-notification__help-text">
							{ translate( 'We’ll send a code to verify your email address.' ) }
						</div>
					) }
				</FormFieldset>

				{ showCodeVerification && (
					<FormFieldset>
						<FormLabel htmlFor="code">
							{ translate( 'Please enter the code you received via email' ) }
						</FormLabel>
						<FormTextInput
							id="code"
							name="code"
							value={ emailItem.code }
							onChange={ handleChange( 'code' ) }
						/>
						{ validationError?.code && (
							<div className="notification-settings__footer-validation-error">
								{ validationError.code }
							</div>
						) }
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
					<div className="notification-settings__footer-buttons">
						<Button onClick={ toggleModal }>
							{ showCodeVerification ? translate( 'Later' ) : translate( 'Cancel' ) }
						</Button>
						<Button
							disabled={
								! emailItem.name ||
								! emailItem.email ||
								( showCodeVerification && ! emailItem.code )
							}
							type="submit"
							primary
						>
							{ translate( 'Verify' ) }
						</Button>
					</div>
				</div>
			</form>
		</Modal>
	);
}
