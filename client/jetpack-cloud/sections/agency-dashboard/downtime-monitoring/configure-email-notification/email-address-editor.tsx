import { Button } from '@automattic/components';
import { Modal } from '@wordpress/components';
import emailValidator from 'email-validator';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useContext, useEffect, useState } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormTextInput from 'calypso/components/forms/form-text-input';
import DashboardDataContext from '../../sites-overview/dashboard-data-context';
import EmailItemContent from './email-item-content';
import type {
	AllowedMonitorContactActions,
	StateMonitorSettingsEmail,
} from '../../sites-overview/types';

interface Props {
	toggleModal: () => void;
	selectedEmail?: StateMonitorSettingsEmail;
	selectedAction?: AllowedMonitorContactActions;
	allEmailItems: Array< StateMonitorSettingsEmail >;
	setAllEmailItems: ( emailAddresses: Array< StateMonitorSettingsEmail > ) => void;
	recordEvent: ( action: string, params?: object ) => void;
}

export default function EmailAddressEditor( {
	toggleModal,
	selectedEmail,
	selectedAction = 'add',
	allEmailItems,
	setAllEmailItems,
	recordEvent,
}: Props ) {
	const translate = useTranslate();

	const [ showCodeVerification, setShowCodeVerification ] = useState< boolean >( false );
	const [ validationError, setValidationError ] = useState<
		{ email?: string; code?: string } | undefined
	>( {} );
	const [ emailItem, setEmailItem ] = useState< {
		name: string;
		email: string;
		code?: string;
		id: string;
	} >( {
		name: '',
		email: '',
		code: '',
		id: '',
	} );

	const { verifiedContacts } = useContext( DashboardDataContext );

	const isVerifyAction = selectedAction === 'verify';
	const isEditAction = selectedAction === 'edit';
	const isRemoveAction = selectedAction === 'remove';

	const handleSetEmailItems = useCallback(
		( isVerified = true ) => {
			const emailItemIndex = allEmailItems.findIndex( ( item ) => item.email === emailItem.id );
			const updatedEmailItem = {
				...emailItem,
				verified: isVerified,
			};
			if ( emailItemIndex > -1 ) {
				allEmailItems[ emailItemIndex ] = updatedEmailItem;
			} else {
				allEmailItems.push( updatedEmailItem );
			}
			setAllEmailItems( allEmailItems );
			toggleModal();
		},
		[ allEmailItems, emailItem, setAllEmailItems, toggleModal ]
	);

	useEffect( () => {
		if ( isVerifyAction ) {
			setShowCodeVerification( true );
		}
	}, [ isVerifyAction ] );

	useEffect( () => {
		if ( selectedEmail ) {
			setEmailItem( {
				name: selectedEmail.name,
				email: selectedEmail.email,
				id: selectedEmail.email,
			} );
		}
	}, [ selectedEmail ] );

	const handleRemove = () => {
		recordEvent( 'downtime_monitoring_remove_email' );
		const emailItems = [ ...allEmailItems ];
		const emailItemIndex = emailItems.findIndex( ( item ) => item.email === emailItem.email );
		if ( emailItemIndex > -1 ) {
			emailItems.splice( emailItemIndex, 1 );
		}
		setAllEmailItems( emailItems );
		toggleModal();
	};

	const handleSendVerificationCode = () => {
		recordEvent( 'downtime_monitoring_request_email_verification_code' );
		setShowCodeVerification( true );
		// TODO: implement sending verification code
	};

	const handleVerifyEmail = () => {
		recordEvent( 'downtime_monitoring_verify_email' );
		// TODO: verify email address with code
	};

	const handleAddVerifiedEmail = () => {
		recordEvent( 'downtime_monitoring_email_already_verified' );
		handleSetEmailItems();
	};

	const onSave = ( event: React.FormEvent< HTMLFormElement > ) => {
		event.preventDefault();

		if ( isRemoveAction ) {
			return handleRemove();
		}

		setValidationError( undefined );

		if (
			allEmailItems.map( ( item ) => item.email ).includes( emailItem.email ) &&
			selectedEmail?.email !== emailItem.email
		) {
			return setValidationError( { email: translate( 'This email address is already in use.' ) } );
		}

		if ( ! emailValidator.validate( emailItem.email ) ) {
			return setValidationError( { email: translate( 'Please enter a valid email address.' ) } );
		}
		if ( showCodeVerification ) {
			handleVerifyEmail();
		} else if ( verifiedContacts.emails.includes( emailItem.email ) ) {
			handleAddVerifiedEmail();
		} else {
			handleSendVerificationCode();
		}
	};

	function onSaveLater() {
		recordEvent( 'downtime_monitoring_verify_email_later' );
		handleSetEmailItems( false );
	}

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

	if ( isRemoveAction ) {
		title = translate( 'Remove Email' );
		subTitle = translate( 'Are you sure you want to remove this email address?' );
	}

	const handleResendCode = () => {
		recordEvent( 'downtime_monitoring_resend_email_verification_code' );
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
				{ isRemoveAction ? (
					selectedEmail && <EmailItemContent isRemoveAction item={ selectedEmail } />
				) : (
					<>
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
					</>
				) }
				<div className="notification-settings__footer">
					<div className="notification-settings__footer-buttons">
						<Button onClick={ showCodeVerification ? onSaveLater : toggleModal }>
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
							{ isRemoveAction ? translate( 'Remove' ) : translate( 'Verify' ) }
						</Button>
					</div>
				</div>
			</form>
		</Modal>
	);
}
