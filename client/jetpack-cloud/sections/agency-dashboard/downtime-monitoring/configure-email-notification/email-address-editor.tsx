import { Button } from '@automattic/components';
import classNames from 'classnames';
import emailValidator from 'email-validator';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import { useCallback, useContext, useEffect, useState, useMemo } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormTextInput from 'calypso/components/forms/form-text-input';
import DashboardModalForm from '../../dashboard-modal-form';
import DashboardModalFormFooter from '../../dashboard-modal-form/footer';
import DashboardDataContext from '../../sites-overview/dashboard-data-context';
import {
	useRequestVerificationCode,
	useValidateVerificationCode,
	useResendVerificationCode,
	useContactModalTitleAndSubtitle,
} from '../hooks';
import EmailItemContent from './email-item-content';
import type {
	AllowedMonitorContactActions,
	StateMonitorSettingsEmail,
	Site,
} from '../../sites-overview/types';

interface Props {
	toggleModal: () => void;
	selectedEmail?: StateMonitorSettingsEmail;
	selectedAction?: AllowedMonitorContactActions;
	allEmailItems: Array< StateMonitorSettingsEmail >;
	setAllEmailItems: ( emailAddresses: Array< StateMonitorSettingsEmail > ) => void;
	recordEvent: ( action: string, params?: object ) => void;
	setVerifiedEmail: ( item: string ) => void;
	sites: Array< Site >;
}

export default function EmailAddressEditor( {
	toggleModal,
	selectedEmail,
	selectedAction = 'add',
	allEmailItems,
	setAllEmailItems,
	recordEvent,
	setVerifiedEmail,
	sites,
}: Props ) {
	const translate = useTranslate();

	const [ showCodeVerification, setShowCodeVerification ] = useState< boolean >( false );
	const [ validationError, setValidationError ] = useState<
		{ email?: string; code?: string } | undefined
	>( {} );
	const [ emailItem, setEmailItem ] = useState< {
		name: string;
		email: string;
		code?: number;
		id: string;
	} >( {
		name: '',
		email: '',
		id: '',
	} );
	const [ resendCodeClicked, setResendCodeClicked ] = useState< boolean >( false );
	const [ helpText, setHelpText ] = useState< TranslateResult | undefined >( undefined );

	const { verifiedContacts } = useContext( DashboardDataContext );

	const isVerifyAction = selectedAction === 'verify';
	const isRemoveAction = selectedAction === 'remove';

	const requestVerificationCode = useRequestVerificationCode();
	const verifyEmail = useValidateVerificationCode();
	const resendCode = useResendVerificationCode();

	const { title, subtitle } = useContactModalTitleAndSubtitle( 'email', selectedAction );

	// Function to handle resending verification code
	const handleResendCode = useCallback( () => {
		if ( emailItem.email ) {
			setValidationError( undefined );
			resendCode.mutate( { type: 'email', value: emailItem.email } );
		}
		// Disabled because we don't want to re-run this effect when resendCode changes
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ emailItem.email ] );

	// Function to handle resend code button click
	const handleResendCodeClick = useCallback( () => {
		setHelpText( undefined );
		setResendCodeClicked( true );
		recordEvent( 'downtime_monitoring_resend_email_verification_code' );
		handleResendCode();
		setEmailItem( { ...emailItem, code: undefined } );
	}, [ emailItem, handleResendCode, recordEvent ] );

	const translationArgs = useMemo(
		() => ( {
			components: {
				button: (
					<Button
						className={ classNames( 'configure-contact__resend-code-button', {
							'is-loading': resendCode.isLoading,
						} ) }
						borderless
						onClick={ handleResendCodeClick }
						disabled={ resendCode.isLoading }
					/>
				),
			},
		} ),
		[ handleResendCodeClick, resendCode.isLoading ]
	);

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

	// Trigger resend code when user chooses to verify email action
	useEffect( () => {
		if ( isVerifyAction ) {
			setShowCodeVerification( true );
			handleResendCode();
		}
	}, [ handleResendCode, isVerifyAction ] );

	// Show code input when verification code request is successful
	useEffect( () => {
		if ( requestVerificationCode.isSuccess ) {
			setShowCodeVerification( true );
		}
	}, [ requestVerificationCode.isSuccess ] );

	// Show error message when verification code request fails
	useEffect( () => {
		if ( requestVerificationCode.isError ) {
			setValidationError( {
				email: translate( 'Something went wrong. Please try again.' ),
			} );
		}
	}, [ requestVerificationCode.isError, translate ] );

	// Add email item to the list once the email is verified
	useEffect( () => {
		if ( verifyEmail.isVerified || requestVerificationCode.isVerified ) {
			handleSetEmailItems();
			setVerifiedEmail( emailItem.email );
		}
	}, [
		emailItem.email,
		handleSetEmailItems,
		requestVerificationCode.isVerified,
		setVerifiedEmail,
		verifyEmail.isVerified,
	] );

	// Show error message when email verification fails
	useEffect( () => {
		if ( verifyEmail.errorMessage ) {
			setValidationError( {
				code: verifyEmail.errorMessage,
			} );
		}
	}, [ translate, verifyEmail.errorMessage ] );

	// Set help text when email verification fails
	useEffect( () => {
		if ( verifyEmail.isError ) {
			setHelpText(
				translate(
					'Please try again or we can {{button}}resend a new code{{/button}}.',
					translationArgs
				)
			);
		}
	}, [ translate, translationArgs, verifyEmail.isError ] );

	// Set help text when resend code is successful and resend button is clicked
	useEffect( () => {
		if ( resendCodeClicked && resendCode.isSuccess ) {
			setHelpText(
				<>
					<div>{ translate( 'We just sent you a new code. Please wait for a minute.' ) }</div>
					<div>
						{ translate(
							'Click to {{button}}resend{{/button}} if you didn’t receive it. If you still experience issues, please reach out to our support.',
							translationArgs
						) }
					</div>
				</>
			);
		}
	}, [ resendCodeClicked, resendCode.isSuccess, translate, translationArgs ] );

	// Show error message when resend code fails
	useEffect( () => {
		if ( resendCode.isError ) {
			setValidationError( {
				code: translate( 'Something went wrong. Please try again by clicking the resend button.' ),
			} );
		}
	}, [ resendCode.isError, translate ] );

	// Set email item when selectedEmail changes
	useEffect( () => {
		if ( selectedEmail ) {
			setEmailItem( {
				name: selectedEmail.name,
				email: selectedEmail.email,
				id: selectedEmail.email,
			} );
		}
	}, [ selectedEmail ] );

	// Refetch verified contacts if failed
	useEffect( () => {
		verifiedContacts.refetchIfFailed();
		// Disable linting because we only want to refetch once
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	// Remove email item when user confirms to remove the email address
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

	// Send verification code when user clicks on Verify button
	const handleSendVerificationCode = () => {
		recordEvent( 'downtime_monitoring_request_email_verification_code' );
		requestVerificationCode.mutate( {
			type: 'email',
			value: emailItem.email,
			site_ids: sites?.map( ( site ) => site.blog_id ) ?? [],
		} );
	};

	// Verify email when user clicks on Verify button
	const handleVerifyEmail = () => {
		setHelpText( undefined );
		recordEvent( 'downtime_monitoring_verify_email' );
		if ( emailItem?.code ) {
			verifyEmail.mutate( {
				type: 'email',
				value: emailItem.email,
				verification_code: Number( emailItem.code ),
			} );
		}
	};

	// Add email item to the list if the email is already verified
	const handleAddVerifiedEmail = () => {
		recordEvent( 'downtime_monitoring_email_already_verified' );
		handleSetEmailItems();
		setVerifiedEmail( emailItem.email );
	};

	const onSave = () => {
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
			return handleVerifyEmail();
		}
		if ( verifiedContacts.emails.includes( emailItem.email ) ) {
			return handleAddVerifiedEmail();
		}
		handleSendVerificationCode();
	};

	// Save unverified email item to the list when user clicks on Later button
	function onSaveLater() {
		recordEvent( 'downtime_monitoring_verify_email_later' );
		handleSetEmailItems( false );
	}

	const handleChange = useCallback(
		( key ) => ( event: React.ChangeEvent< HTMLInputElement > ) => {
			setEmailItem( ( prevState ) => ( { ...prevState, [ key ]: event.target.value } ) );
		},
		[]
	);

	const verificationButtonTitle = verifyEmail.isLoading
		? translate( 'Verifying…' )
		: translate( 'Verify' );

	return (
		<DashboardModalForm
			title={ title }
			subtitle={ subtitle }
			onClose={ toggleModal }
			onSubmit={ onSave }
		>
			{ isRemoveAction ? (
				selectedEmail && (
					<div className="margin-top-16">
						<EmailItemContent isRemoveAction item={ selectedEmail } />
					</div>
				)
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
							aria-describedby={ ! isVerifyAction ? 'name-help-text' : undefined }
						/>
						{ ! isVerifyAction && (
							<div className="configure-contact__help-text" id="name-help-text">
								{ translate( 'Give this email a nickname for your personal reference.' ) }
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
							aria-describedby={ ! isVerifyAction ? 'email-help-text' : undefined }
						/>
						{ validationError?.email && (
							<div className="dashboard-modal-form__footer-error" role="alert">
								{ validationError.email }
							</div>
						) }
						{ ! isVerifyAction && (
							<div className="configure-contact__help-text" id="email-help-text">
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
								value={ emailItem.code || '' }
								onChange={ handleChange( 'code' ) }
							/>
							{ validationError?.code && (
								<div className="dashboard-modal-form__footer-error" role="alert">
									{ validationError.code }
								</div>
							) }
							<div className="configure-contact__help-text" id="code-help-text">
								{ helpText ??
									( resendCodeClicked && resendCode.isLoading
										? translate( 'Sending code' )
										: translate(
												'Please wait for a minute. If you didn’t receive it, we can {{button}}resend{{/button}} it.',
												translationArgs
										  ) ) }
							</div>
						</FormFieldset>
					) }
				</>
			) }

			<DashboardModalFormFooter>
				<Button onClick={ showCodeVerification ? onSaveLater : toggleModal }>
					{ showCodeVerification ? translate( 'Later' ) : translate( 'Back' ) }
				</Button>
				<Button
					disabled={
						! emailItem.name ||
						! emailItem.email ||
						( showCodeVerification && ! emailItem.code ) ||
						verifyEmail.isLoading ||
						requestVerificationCode.isLoading
					}
					type="submit"
					primary
				>
					{ isRemoveAction ? translate( 'Remove' ) : verificationButtonTitle }
				</Button>
			</DashboardModalFormFooter>
		</DashboardModalForm>
	);
}
