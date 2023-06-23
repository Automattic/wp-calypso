import { Button } from '@automattic/components';
import classNames from 'classnames';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import QuerySmsCountries from 'calypso/components/data/query-countries/sms';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormPhoneInput from 'calypso/components/forms/form-phone-input';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { useSelector } from 'calypso/state';
import getCountries from 'calypso/state/selectors/get-countries';
import DashboardModalForm from '../../dashboard-modal-form';
import DashboardModalFormFooter from '../../dashboard-modal-form/footer';
import DashboardDataContext from '../../sites-overview/dashboard-data-context';
import {
	AllowedMonitorContactActions,
	AllowedMonitorContactTypes,
	Site,
	StateMonitorSettingsEmail,
	StateMonitorSettingsSMS,
} from '../../sites-overview/types';
import ContactListItem from '../contact-list/item';
import {
	useContactModalTitleAndSubtitle,
	useRequestVerificationCode,
	useResendVerificationCode,
	useValidateVerificationCode,
} from '../hooks';
import { ContactInfo } from './types';
import {
	getContactInfoPayload,
	getContactInfoValue,
	getDefaultContactInfo,
	isCompleteContactInfo,
	isContactAlreadyExists,
	isMatchingContactInfo,
	isValidContactInfo,
	removeFromContactList,
} from './utils';

type Props = {
	type: AllowedMonitorContactTypes;
	action?: AllowedMonitorContactActions;
	selectedContact?: StateMonitorSettingsEmail | StateMonitorSettingsSMS;
	contacts: Array< StateMonitorSettingsEmail | StateMonitorSettingsSMS >;
	setContacts: ( contacts: Array< StateMonitorSettingsEmail | StateMonitorSettingsSMS > ) => void;
	setVerifiedContact: ( item: string ) => void;
	recordEvent: ( action: string, params?: object ) => void;
	onClose: () => void;
	sites: Array< Site >;
};

export default function ContactEditor( {
	type,
	action = 'add',
	onClose,
	selectedContact,
	contacts,
	setContacts,
	recordEvent,
	setVerifiedContact,
	sites,
}: Props ) {
	const translate = useTranslate();

	const { title, subtitle } = useContactModalTitleAndSubtitle( type, action );

	const countriesList = useSelector( ( state ) => getCountries( state, 'sms' ) ?? [] );

	const [ helpText, setHelpText ] = useState< TranslateResult | undefined >( undefined );

	const [ showCodeVerification, setShowCodeVerification ] = useState< boolean >( false );

	const [ resendCodeClicked, setResendCodeClicked ] = useState< boolean >( false );

	const [ phoneValidationStatus, setPhoneValidationStatus ] = useState< {
		isValid: boolean;
		errorMessage: string;
	} >( {
		isValid: true,
		errorMessage: '',
	} );

	const [ validationError, setValidationError ] = useState<
		{ email?: string; phone?: string; code?: string } | undefined
	>( {} );

	const [ contactInfo, setContactInfo ] = useState< ContactInfo >(
		getDefaultContactInfo( type, selectedContact )
	);

	const {
		isLoading: isSubmittingVerificationCode,
		isVerified: isSubmittingVerificationCodeSuccess,
		isError: isSubmittingVerificationCodeFailed,
		errorMessage: submitVerificationCodeErrorMessage,
		mutate: submitVerificationCode,
	} = useValidateVerificationCode();
	const {
		isLoading: isRequestingVerificationCode,
		isSuccess: isRequestingVerificationCodeSuccess,
		isError: isRequestingVerificationCodeFailed,
		isVerified: isRequestingVerificationCodeAlreadyVerified,
		mutate: requestVerificationCode,
	} = useRequestVerificationCode();

	const {
		isLoading: isResendingVerificationCode,
		isSuccess: isResendingVerificationCodeSuccess,
		isError: isResendingVerificationCodeFailed,
		mutate: resendingVerificationCode,
	} = useResendVerificationCode();

	const { verifiedContacts } = useContext( DashboardDataContext );

	const isRemoveAction = action === 'remove';
	const isVerifyAction = action === 'verify';

	const noCountryList = countriesList.length === 0;

	const updateContactStatusFromList = useCallback(
		( verified = false ) => {
			setContacts(
				contacts.map( ( item ) => {
					if (
						type === 'email' &&
						( item as StateMonitorSettingsEmail ).email === contactInfo.id
					) {
						return {
							...( selectedContact as StateMonitorSettingsEmail ),
							verified,
						};
					}
					if (
						type === 'sms' &&
						( item as StateMonitorSettingsSMS ).phoneNumberFull === contactInfo.id
					) {
						return {
							...( selectedContact as StateMonitorSettingsSMS ),
							verified,
						};
					}

					return item;
				} )
			);

			onClose();
		},
		[ contactInfo.id, contacts, onClose, selectedContact, setContacts, type ]
	);

	// Remove contact when user confirms to remove it.
	const handleRemove = () => {
		if ( selectedContact ) {
			recordEvent( 'downtime_monitoring_remove_email' );
			setContacts( removeFromContactList( type, contacts, selectedContact ) );
		}
		onClose();
	};

	// Send verification code when user clicks on Verify button
	const handleRequestVerificationCode = () => {
		recordEvent( 'downtime_monitoring_request_email_verification_code' );
		requestVerificationCode( {
			...getContactInfoPayload( type, contactInfo ),
			site_ids: sites?.map( ( site ) => site.blog_id ) ?? [],
		} );
	};

	// Verify email when user clicks on Verify button
	const handleSubmitVerificationCode = () => {
		setHelpText( undefined );
		recordEvent( 'downtime_monitoring_verify_email' );
		if ( contactInfo?.verificationCode ) {
			submitVerificationCode( {
				...getContactInfoPayload( type, contactInfo ),
				verification_code: Number( contactInfo.verificationCode ),
			} );
		}
	};

	// Add email item to the list if the email is already verified
	const handleAddVerifiedContact = () => {
		recordEvent( 'downtime_monitoring_email_already_verified' );
		updateContactStatusFromList( true );
		setVerifiedContact( getContactInfoValue( type, contactInfo ) );
	};

	// Function to handle resending verification code
	const handleResendCode = useCallback( () => {
		if ( contactInfo.email ) {
			setValidationError( undefined );
			if ( type === 'email' ) {
				resendingVerificationCode( {
					type,
					value: getContactInfoValue( type, contactInfo ),
				} );
			}

			// TO-DO, add logic for resending SMS verification code
		}
		// Disabled because we don't want to re-run this effect when resendCode changes
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ contactInfo ] );

	// Function to handle resend code button click
	const handleResendCodeClick = useCallback( () => {
		setHelpText( undefined );
		setResendCodeClicked( true );
		recordEvent( 'downtime_monitoring_resend_email_verification_code' );
		handleResendCode();
		setContactInfo( { ...contactInfo, verificationCode: undefined } );
	}, [ contactInfo, handleResendCode, recordEvent ] );

	const onSubmit = () => {
		if ( isRemoveAction ) {
			return handleRemove();
		}

		setValidationError( undefined );

		if ( type === 'email' ) {
			if ( ! isValidContactInfo( type, contactInfo ) ) {
				return setValidationError( { email: translate( 'Please enter a valid email address.' ) } );
			}

			const isNewContact =
				! selectedContact || ! isMatchingContactInfo( type, selectedContact, contactInfo );

			if ( isContactAlreadyExists( type, contacts, contactInfo ) && isNewContact ) {
				return setValidationError( {
					email: translate( 'This email address is already in use.' ),
				} );
			}
		}

		if ( type === 'sms' ) {
			if ( ! phoneValidationStatus.isValid ) {
				return setValidationError( { phone: phoneValidationStatus.errorMessage } );
			}

			const isNewContact =
				! selectedContact || ! isMatchingContactInfo( type, selectedContact, contactInfo );

			if ( isContactAlreadyExists( type, contacts, contactInfo ) && isNewContact ) {
				return setValidationError( {
					email: translate( 'This phone number is already in use.' ),
				} );
			}
		}

		if ( showCodeVerification ) {
			return handleSubmitVerificationCode();
		}

		if (
			( type === 'email' &&
				contactInfo.email &&
				verifiedContacts.emails.includes( contactInfo.email ) ) ||
			( type === 'sms' &&
				contactInfo.phoneNumberFull &&
				verifiedContacts.phoneNumbers.includes( contactInfo.phoneNumberFull ) )
		) {
			return handleAddVerifiedContact();
		}

		handleRequestVerificationCode();
	};

	const onSaveLater = () => {
		recordEvent( 'downtime_monitoring_verify_email_later' );
		updateContactStatusFromList();
	};

	const isLoading = isSubmittingVerificationCode || isRequestingVerificationCode;

	const isSubmitDisabled =
		! isCompleteContactInfo( type, contactInfo, showCodeVerification ) || isLoading;

	const verificationButtonTitle = isSubmittingVerificationCode
		? translate( 'Verifying…' )
		: translate( 'Verify' );

	const handleInputChange = useCallback(
		( key ) => ( event: React.ChangeEvent< HTMLInputElement > ) => {
			setContactInfo( ( prevState ) => ( { ...prevState, [ key ]: event.target.value } ) );
		},
		[]
	);

	const handlePhoneInputChange = ( {
		phoneNumberFull,
		phoneNumber,
		countryData,
		isValid,
		validation,
	}: {
		phoneNumberFull: string;
		phoneNumber: string;
		countryData: {
			code: string;
			numeric_code: string;
		};
		isValid: boolean;
		validation: {
			message: string;
		};
	} ) => {
		setPhoneValidationStatus( {
			isValid,
			errorMessage: validation.message,
		} );

		setContactInfo( ( prevState ) => ( {
			...prevState,
			phoneNumberFull,
			phoneNumber,
			countryCode: countryData.code,
			countryNumericCode: countryData.numeric_code,
		} ) );
		if ( isValid ) {
			setValidationError( {
				phone: undefined,
			} );
		}
	};

	const translationArgs = useMemo(
		() => ( {
			components: {
				button: (
					<Button
						className={ classNames( 'configure-contact__resend-code-button', {
							'is-loading': isResendingVerificationCode,
						} ) }
						borderless
						onClick={ handleResendCodeClick }
						disabled={ isResendingVerificationCode }
					/>
				),
			},
		} ),
		[ handleResendCodeClick, isResendingVerificationCode ]
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
		if ( isRequestingVerificationCodeSuccess ) {
			setShowCodeVerification( true );
		}
	}, [ isRequestingVerificationCodeSuccess ] );

	// Show error message when verification code request fails
	useEffect( () => {
		if ( isRequestingVerificationCodeFailed ) {
			setValidationError( {
				email: translate( 'Something went wrong. Please try again.' ),
			} );
		}
	}, [ isRequestingVerificationCodeFailed, translate ] );

	// Add email item to the list once the email is verified
	useEffect( () => {
		if ( isSubmittingVerificationCodeSuccess || isRequestingVerificationCodeAlreadyVerified ) {
			updateContactStatusFromList( true );
			setVerifiedContact( getContactInfoValue( type, contactInfo ) );
		}
	}, [
		contactInfo,
		isRequestingVerificationCodeAlreadyVerified,
		isSubmittingVerificationCodeSuccess,
		setVerifiedContact,
		type,
		updateContactStatusFromList,
	] );

	// Show error message when email verification fails
	useEffect( () => {
		if ( submitVerificationCodeErrorMessage ) {
			setValidationError( {
				code: submitVerificationCodeErrorMessage,
			} );
		}
	}, [ translate, submitVerificationCodeErrorMessage ] );

	// Set help text when email verification fails
	useEffect( () => {
		if ( isSubmittingVerificationCodeFailed ) {
			setHelpText(
				translate(
					'Please try again or we can {{button}}resend a new code{{/button}}.',
					translationArgs
				)
			);
		}
	}, [ translate, translationArgs, isSubmittingVerificationCodeFailed ] );

	// Set help text when resend code is successful and resend button is clicked
	useEffect( () => {
		if ( resendCodeClicked && isResendingVerificationCodeSuccess ) {
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
	}, [ resendCodeClicked, isResendingVerificationCodeSuccess, translate, translationArgs ] );

	// Show error message when resend code fails
	useEffect( () => {
		if ( isResendingVerificationCodeFailed ) {
			setValidationError( {
				code: translate( 'Something went wrong. Please try again by clicking the resend button.' ),
			} );
		}
	}, [ isResendingVerificationCodeFailed, translate ] );

	// Refetch verified contacts if failed
	useEffect( () => {
		verifiedContacts.refetchIfFailed();
		// Disable linting because we only want to refetch once
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	return (
		<DashboardModalForm
			title={ title }
			subtitle={ subtitle }
			onClose={ onClose }
			onSubmit={ onSubmit }
		>
			{ isRemoveAction ? (
				selectedContact && (
					<div className="margin-top-16">
						<ContactListItem type={ type } item={ selectedContact } />
					</div>
				)
			) : (
				<>
					<FormFieldset>
						<FormLabel htmlFor="name">{ translate( 'Name' ) }</FormLabel>
						<FormTextInput
							id="name"
							name="name"
							value={ contactInfo.name }
							disabled={ showCodeVerification }
							onChange={ handleInputChange( 'name' ) }
							aria-describedby={ ! isVerifyAction ? 'name-help-text' : undefined }
						/>
						{ ! isVerifyAction && (
							<div className="configure-contact__help-text" id="name-help-text">
								{ type === 'email' &&
									translate( 'Give this email a nickname for your personal reference.' ) }
								{ type === 'sms' &&
									translate( 'Give this number a nickname for your personal reference.' ) }
							</div>
						) }
					</FormFieldset>

					{ type === 'email' && (
						<FormFieldset>
							<FormLabel htmlFor="email">{ translate( 'Email' ) }</FormLabel>
							<FormTextInput
								id="email"
								name="email"
								value={ contactInfo.email }
								disabled={ showCodeVerification }
								onChange={ handleInputChange( 'email' ) }
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
					) }

					{ type === 'sms' && (
						<div className="configure-contact__phone-input-container">
							{
								// Fetch countries list only if not available
								noCountryList && <QuerySmsCountries />
							}
							<FormPhoneInput
								isDisabled={ noCountryList || showCodeVerification }
								countriesList={ countriesList }
								initialCountryCode={ contactInfo.countryCode }
								initialPhoneNumber={ contactInfo.phoneNumber }
								onChange={ handlePhoneInputChange }
								className="configure-contact__phone-input"
							/>
							{ validationError?.phone && (
								<div className="dashboard-modal-form__footer-error" role="alert">
									{ validationError?.phone }
								</div>
							) }
							{ ! isVerifyAction && (
								<div className="configure-contact__help-text" id="phone-help-text">
									{ translate( 'We’ll send a code to verify your phone number.' ) }
								</div>
							) }
						</div>
					) }

					{ showCodeVerification && (
						<FormFieldset>
							<FormLabel htmlFor="code">
								{ type === 'email' && translate( 'Please enter the code you received via email' ) }
								{ type === 'sms' && translate( 'Please enter the code you received via SMS' ) }
							</FormLabel>
							<FormTextInput
								id="code"
								name="code"
								value={ contactInfo.verificationCode || '' }
								onChange={ handleInputChange( 'verificationCode' ) }
							/>
							{ validationError?.code && (
								<div className="dashboard-modal-form__footer-error" role="alert">
									{ validationError.code }
								</div>
							) }
							<div className="configure-contact__help-text" id="code-help-text">
								{ helpText ??
									( resendCodeClicked && isResendingVerificationCode
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
				<Button onClick={ showCodeVerification ? onSaveLater : onClose }>
					{ showCodeVerification ? translate( 'Later' ) : translate( 'Back' ) }
				</Button>
				<Button disabled={ isSubmitDisabled } type="submit" primary>
					{ isRemoveAction ? translate( 'Remove' ) : verificationButtonTitle }
				</Button>
			</DashboardModalFormFooter>
		</DashboardModalForm>
	);
}
