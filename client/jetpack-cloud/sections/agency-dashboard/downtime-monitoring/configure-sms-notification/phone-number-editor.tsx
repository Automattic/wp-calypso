import { Button } from '@automattic/components';
import { Modal } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState, useContext, useEffect } from 'react';
import QuerySmsCountries from 'calypso/components/data/query-countries/sms';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormPhoneInput from 'calypso/components/forms/form-phone-input';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { useSelector } from 'calypso/state';
import getCountries from 'calypso/state/selectors/get-countries';
import DashboardDataContext from '../../sites-overview/dashboard-data-context';
import { useRequestVerificationCode } from '../hooks';
import { getContactModalTitleAndSubTitle } from '../utils';
import type {
	StateMonitorSettingsSMS,
	Site,
	AllowedMonitorContactActions,
} from '../../sites-overview/types';

interface Props {
	toggleModal: () => void;
	selectedPhone?: StateMonitorSettingsSMS;
	selectedAction?: AllowedMonitorContactActions;
	allPhoneItems: Array< StateMonitorSettingsSMS >;
	setAllPhoneItems: ( phoneNumbers: Array< StateMonitorSettingsSMS > ) => void;
	setVerifiedPhoneNumber: ( item: string ) => void;
	sites: Array< Site >;
}

interface FormPhoneInputChangeResult {
	name: string;
	countryCode: string;
	countryNumericCode: string;
	phoneNumber: string;
	phoneNumberFull: string;
	verificationCode?: string;
	id?: string;
}

export default function PhoneNumberEditor( {
	toggleModal,
	selectedPhone,
	selectedAction = 'add',
	allPhoneItems,
	setAllPhoneItems,
	setVerifiedPhoneNumber,
	sites,
}: Props ) {
	const translate = useTranslate();

	const countriesList = useSelector( ( state ) => getCountries( state, 'sms' ) ?? [] );

	const [ showCodeVerification, setShowCodeVerification ] = useState< boolean >( false );
	const [ validationStatus, setValidationStatus ] = useState< {
		isValid: boolean;
		errorMessage: string;
	} >( {
		isValid: true,
		errorMessage: '',
	} );
	const [ validationError, setValidationError ] = useState<
		{ phone?: string; verificationCode?: string } | undefined
	>();
	const [ phoneItem, setPhoneItem ] = useState< FormPhoneInputChangeResult >( {
		name: selectedPhone?.name ?? '',
		countryCode: selectedPhone?.countryCode ?? '',
		countryNumericCode: selectedPhone?.countryNumericCode ?? '',
		phoneNumber: selectedPhone?.phoneNumber ?? '',
		phoneNumberFull: selectedPhone?.phoneNumberFull ?? '',
		id: selectedPhone?.phoneNumberFull ?? '',
	} );

	const { verifiedContacts } = useContext( DashboardDataContext );

	const isVerifyAction = selectedAction === 'verify';

	const requestVerificationCode = useRequestVerificationCode();

	const handleSetPhoneItems = useCallback(
		( isVerified = true ) => {
			const phoneItemIndex = allPhoneItems.findIndex(
				( item ) => item.phoneNumberFull === phoneItem.id
			);
			const updatedPhoneItem = {
				...phoneItem,
				verified: isVerified,
			};
			if ( phoneItemIndex > -1 ) {
				allPhoneItems[ phoneItemIndex ] = updatedPhoneItem;
			} else {
				allPhoneItems.push( updatedPhoneItem );
			}
			setAllPhoneItems( allPhoneItems );
			toggleModal();
		},
		[ allPhoneItems, phoneItem, setAllPhoneItems, toggleModal ]
	);

	// Function to handle request verification code
	const handleRequestVerificationCode = () => {
		requestVerificationCode.mutate( {
			type: 'sms',
			value: Number( phoneItem.phoneNumber ),
			site_ids: sites?.map( ( site ) => site.blog_id ) ?? [],
			country_code: phoneItem.countryCode,
			country_numeric_code: phoneItem.countryNumericCode,
		} );
	};

	// Trigger resend code when user chooses to verify email action
	useEffect( () => {
		if ( isVerifyAction ) {
			setShowCodeVerification( true );
			// TODO: call resend verification code API
		}
	}, [ isVerifyAction ] );

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
				phone: translate( 'Something went wrong. Please try again.' ),
			} );
		}
	}, [ requestVerificationCode.isError, translate ] );

	// Function to handle resend code button click
	const handleResendCodeClick = useCallback( () => {
		setPhoneItem( { ...phoneItem, verificationCode: undefined } );
		// TODO: Make API call to resend verification code
	}, [ phoneItem ] );

	// Add phone item to the list if the phone number is already verified
	const handleAddVerifiedPhoneNumber = () => {
		handleSetPhoneItems();
		setVerifiedPhoneNumber( phoneItem.phoneNumberFull );
	};

	// Verify phone number when user clicks on Verify button
	const handleVerifyPhoneNumber = () => {
		if ( phoneItem?.verificationCode ) {
			// Handle verify phone number API call
		}
	};

	// Save unverified phone number to the list when user clicks on Later button
	function onSaveLater() {
		handleSetPhoneItems( false );
	}

	const onSave = ( event: React.FormEvent< HTMLFormElement > ) => {
		event.preventDefault();
		setValidationError( undefined );
		if ( validationStatus.isValid ) {
			if (
				allPhoneItems
					.map( ( item ) => item.phoneNumberFull )
					.includes( phoneItem.phoneNumberFull ) &&
				selectedPhone?.phoneNumberFull !== phoneItem.phoneNumberFull
			) {
				return setValidationError( {
					phone: translate( 'This phone number is already in use.' ),
				} );
			} else if ( showCodeVerification ) {
				return handleVerifyPhoneNumber();
			} else if ( verifiedContacts.phoneNumbers.includes( phoneItem.phoneNumberFull ) ) {
				return handleAddVerifiedPhoneNumber();
			}
			return handleRequestVerificationCode();
		}
		setValidationError( { phone: validationStatus.errorMessage } );
	};

	const translationArgs = {
		components: {
			button: (
				<Button
					className="configure-contact__resend-code-button"
					borderless
					onClick={ handleResendCodeClick }
				/>
			),
		},
	};

	const handleChange = useCallback(
		( key ) => ( event: React.ChangeEvent< HTMLInputElement > ) => {
			setPhoneItem( ( prevState ) => ( { ...prevState, [ key ]: event.target.value } ) );
		},
		[]
	);

	const { title, subTitle } = getContactModalTitleAndSubTitle.phone[ selectedAction ];

	const onChangePhoneInput = ( {
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
		setValidationStatus( {
			isValid,
			errorMessage: validation.message,
		} );
		setPhoneItem( ( prevState ) => ( {
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

	const noCountryList = countriesList.length === 0;

	const isDisabled =
		! phoneItem.name ||
		! phoneItem.countryCode ||
		! phoneItem.phoneNumber ||
		( showCodeVerification && ! phoneItem.verificationCode ) ||
		requestVerificationCode.isLoading;

	return (
		<Modal
			open={ true }
			onRequestClose={ toggleModal }
			title={ title }
			className="notification-settings__modal"
		>
			<div className="notification-settings__sub-title">{ subTitle }</div>

			<form className="configure-contact__form" onSubmit={ onSave }>
				<>
					<FormFieldset>
						<FormLabel htmlFor="name">{ translate( 'Name' ) }</FormLabel>
						<FormTextInput
							id="name"
							name="name"
							value={ phoneItem.name }
							onChange={ handleChange( 'name' ) }
							aria-describedby={ ! isVerifyAction ? 'name-help-text' : undefined }
							disabled={ showCodeVerification }
						/>
						{ ! isVerifyAction && (
							<div className="configure-contact__help-text" id="name-help-text">
								{ translate( 'Give this number a name for your personal reference.' ) }
							</div>
						) }
					</FormFieldset>
					<div className="configure-contact__phone-input-container">
						{
							// Fetch countries list only if not available
							noCountryList && <QuerySmsCountries />
						}
						<FormPhoneInput
							isDisabled={ noCountryList || showCodeVerification }
							countriesList={ countriesList }
							initialCountryCode={ phoneItem.countryCode }
							initialPhoneNumber={ phoneItem.phoneNumber }
							onChange={ onChangePhoneInput }
							className="configure-contact__phone-input"
						/>
						{ validationError?.phone && (
							<div className="notification-settings__footer-validation-error" role="alert">
								{ validationError?.phone }
							</div>
						) }
						{ ! isVerifyAction && (
							<div className="configure-contact__help-text" id="phone-help-text">
								{ translate( 'We’ll send a code to verify your phone number.' ) }
							</div>
						) }
					</div>
					{ showCodeVerification && (
						<FormFieldset>
							<FormLabel htmlFor="code">
								{ translate( 'Please enter the code you received via SMS' ) }
							</FormLabel>
							<FormTextInput
								id="code"
								name="code"
								value={ phoneItem.verificationCode || '' }
								onChange={ handleChange( 'verificationCode' ) }
							/>
							{ validationError?.verificationCode && (
								<div className="notification-settings__footer-validation-error" role="alert">
									{ validationError.verificationCode }
								</div>
							) }
							<div className="configure-contact__help-text" id="code-help-text">
								{ translate(
									'Please wait for a minute. If you didn’t receive it, we can {{button}}resend{{/button}} it.',
									translationArgs
								) }
							</div>
						</FormFieldset>
					) }
				</>
				<div className="notification-settings__footer">
					<div className="notification-settings__footer-buttons">
						<Button onClick={ showCodeVerification ? onSaveLater : toggleModal }>
							{ showCodeVerification ? translate( 'Later' ) : translate( 'Back' ) }
						</Button>
						<Button disabled={ isDisabled } type="submit" primary>
							{ translate( 'Verify' ) }
						</Button>
					</div>
				</div>
			</form>
		</Modal>
	);
}
