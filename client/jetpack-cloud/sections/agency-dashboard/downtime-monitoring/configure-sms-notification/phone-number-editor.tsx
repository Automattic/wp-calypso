import { Button } from '@automattic/components';
import { Modal } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import QuerySmsCountries from 'calypso/components/data/query-countries/sms';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormPhoneInput from 'calypso/components/forms/form-phone-input';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { useSelector } from 'calypso/state';
import getCountries from 'calypso/state/selectors/get-countries';
import type { StateMonitorSettingsSMS } from '../../sites-overview/types';

interface Props {
	toggleModal: () => void;
	allPhoneItems: Array< StateMonitorSettingsSMS >;
	setAllPhoneItems: ( phoneNumbers: Array< StateMonitorSettingsSMS > ) => void;
}

interface FormPhoneInputChangeResult {
	name: string;
	countryCode: string;
	phoneNumber: string;
	phoneNumberFull: string;
}

export default function PhoneNumberEditor( {
	toggleModal,
	allPhoneItems,
	setAllPhoneItems,
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
		{ phone?: string; code?: string } | undefined
	>();
	const [ smsItem, setSMSItem ] = useState< FormPhoneInputChangeResult >( {
		name: '',
		countryCode: '',
		phoneNumber: '',
		phoneNumberFull: '',
	} );

	const handleSetSMSItems = useCallback(
		( isVerified = true ) => {
			const updatedPhoneItem = {
				...smsItem,
				verified: isVerified,
			};
			// Check if exists when editing
			allPhoneItems.push( updatedPhoneItem );
			setAllPhoneItems( allPhoneItems );
			toggleModal();
		},
		[ allPhoneItems, smsItem, setAllPhoneItems, toggleModal ]
	);

	const handleRequestVerificationCode = () => {
		setShowCodeVerification( true );
		// TODO: Make API call to request verification code
	};

	// Save unverified phone number to the list when user clicks on Later button
	function onSaveLater() {
		handleSetSMSItems( false );
	}

	const onSave = ( event: React.FormEvent< HTMLFormElement > ) => {
		event.preventDefault();
		setValidationError( undefined );
		if ( validationStatus.isValid ) {
			if ( showCodeVerification ) {
				// TODO: Add code verification
			}
			return handleRequestVerificationCode();
		}
		setValidationError( { phone: validationStatus.errorMessage } );
	};

	const handleChange = useCallback(
		( key ) => ( event: React.ChangeEvent< HTMLInputElement > ) => {
			setSMSItem( ( prevState ) => ( { ...prevState, [ key ]: event.target.value } ) );
		},
		[]
	);

	const title = translate( 'Add your phone number' );
	const subTitle = translate( 'Please use an accessible phone number. Only alerts sent.' );

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
		setSMSItem( ( prevState ) => ( {
			...prevState,
			phoneNumberFull,
			phoneNumber,
			countryCode: countryData.code,
		} ) );
	};

	const noCountryList = countriesList.length === 0;

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
							value={ smsItem.name }
							onChange={ handleChange( 'name' ) }
							aria-describedby="name-help-text"
							disabled={ showCodeVerification }
						/>
						<div className="configure-contact__help-text" id="name-help-text">
							{ translate( 'Give this number a name for your personal reference.' ) }
						</div>
					</FormFieldset>
					{
						// Fetch countries list only if not available
						noCountryList && <QuerySmsCountries />
					}
					<FormPhoneInput
						isDisabled={ noCountryList || showCodeVerification }
						countriesList={ countriesList }
						initialCountryCode={ smsItem.countryCode }
						initialPhoneNumber={ smsItem.phoneNumber }
						onChange={ onChangePhoneInput }
						className="configure-contact__phone-input"
					/>
					{ ! validationStatus.isValid && validationError?.phone && (
						<div className="notification-settings__footer-validation-error" role="alert">
							{ validationStatus.errorMessage }
						</div>
					) }
					<div className="configure-contact__help-text" id="phone-help-text">
						{ translate( 'We’ll send a code to verify your phone number.' ) }
					</div>
					{ showCodeVerification && (
						<h3 style={ { marginTop: 16 } }>
							TODO: Allow users to verify their phone number by entering a code.
						</h3>
					) }
				</>
				<div className="notification-settings__footer">
					<div className="notification-settings__footer-buttons">
						<Button onClick={ showCodeVerification ? onSaveLater : toggleModal }>
							{ showCodeVerification ? translate( 'Later' ) : translate( 'Back' ) }
						</Button>
						<Button
							disabled={ ! smsItem.name || ! smsItem.countryCode || ! smsItem.phoneNumber }
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
