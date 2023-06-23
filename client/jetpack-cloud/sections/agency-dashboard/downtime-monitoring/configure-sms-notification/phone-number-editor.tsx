import { Button } from '@automattic/components';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import { useCallback, useState, useContext, useEffect, useMemo } from 'react';
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
	useRequestVerificationCode,
	useValidateVerificationCode,
	useContactModalTitleAndSubtitle,
} from '../hooks';
import SMSItemContent from './sms-item-content';
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
	isRemoveAction?: boolean;
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

	const [ helpText, setHelpText ] = useState< TranslateResult | undefined >( undefined );
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
	const isRemoveAction = selectedAction === 'remove';

	const requestVerificationCode = useRequestVerificationCode();
	const verifyPhoneNumber = useValidateVerificationCode();

	const { title, subtitle } = useContactModalTitleAndSubtitle( 'phone', selectedAction );

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

	// Function to handle resend code button click
	const handleResendCodeClick = useCallback( () => {
		setHelpText( undefined );
		setPhoneItem( { ...phoneItem, verificationCode: undefined } );
		// TODO: Make API call to resend verification code
	}, [ phoneItem ] );

	const translationArgs = useMemo(
		() => ( {
			components: {
				button: (
					<Button
						className="configure-contact__resend-code-button"
						borderless
						onClick={ handleResendCodeClick }
					/>
				),
			},
		} ),
		[ handleResendCodeClick ]
	);

	// Function to handle request verification code
	const handleRequestVerificationCode = () => {
		requestVerificationCode.mutate( {
			type: 'sms',
			value: `${ phoneItem.countryNumericCode }${ phoneItem.phoneNumber }`,
			number: phoneItem.phoneNumber,
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

	// Add phone item to the list if the phone number is already verified
	const handleAddVerifiedPhoneNumber = () => {
		handleSetPhoneItems();
		setVerifiedPhoneNumber( phoneItem.phoneNumberFull );
	};

	// Verify phone number when user clicks on Verify button
	const handleVerifyPhoneNumber = () => {
		setHelpText( undefined );
		if ( phoneItem?.verificationCode ) {
			verifyPhoneNumber.mutate( {
				type: 'sms',
				value: `${ phoneItem.countryNumericCode }${ phoneItem.phoneNumber }`,
				verification_code: Number( phoneItem.verificationCode ),
			} );
		}
	};

	// Add phone item to the list once the phone number is verified
	useEffect( () => {
		if ( verifyPhoneNumber.isVerified || requestVerificationCode.isVerified ) {
			handleSetPhoneItems();
			setVerifiedPhoneNumber( phoneItem.phoneNumberFull );
		}
	}, [
		verifyPhoneNumber.isVerified,
		phoneItem.phoneNumberFull,
		handleSetPhoneItems,
		setVerifiedPhoneNumber,
		requestVerificationCode.isVerified,
	] );

	// Show error message when phone number verification fails
	useEffect( () => {
		if ( verifyPhoneNumber.errorMessage ) {
			setValidationError( {
				verificationCode: verifyPhoneNumber.errorMessage,
			} );
		}
	}, [ translate, verifyPhoneNumber.errorMessage ] );

	// Refetch verified contacts if failed
	useEffect( () => {
		verifiedContacts.refetchIfFailed();
		// Disable linting because we only want to refetch once
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	// Set help text when phone number verification fails
	useEffect( () => {
		if ( verifyPhoneNumber.isError ) {
			setHelpText(
				translate(
					'Please try again or we can {{button}}resend a new code{{/button}}.',
					translationArgs
				)
			);
		}
	}, [ translate, translationArgs, verifyPhoneNumber.isError ] );

	// Save unverified phone number to the list when user clicks on Later button
	function onSaveLater() {
		handleSetPhoneItems( false );
	}

	// Remove phone item when user confirms to remove the phone number
	const handleRemove = () => {
		//TODO: add tracks event
		const phoneItems = [ ...allPhoneItems ];
		const phoneItemIndex = phoneItems.findIndex(
			( item ) => item.phoneNumberFull === phoneItem.phoneNumberFull
		);
		if ( phoneItemIndex > -1 ) {
			phoneItems.splice( phoneItemIndex, 1 );
		}
		setAllPhoneItems( phoneItems );
		toggleModal();
	};

	const onSave = () => {
		if ( isRemoveAction ) {
			return handleRemove();
		}

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

	const handleChange = useCallback(
		( key ) => ( event: React.ChangeEvent< HTMLInputElement > ) => {
			setPhoneItem( ( prevState ) => ( { ...prevState, [ key ]: event.target.value } ) );
		},
		[]
	);

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
		verifyPhoneNumber.isLoading ||
		requestVerificationCode.isLoading;

	const verificationButtonTitle = verifyPhoneNumber.isLoading
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
				selectedPhone && (
					<div className="margin-top-16">
						<SMSItemContent isRemoveAction item={ selectedPhone } />
					</div>
				)
			) : (
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
								<div className="dashboard-modal-form__footer-error" role="alert">
									{ validationError.verificationCode }
								</div>
							) }
							<div className="configure-contact__help-text" id="code-help-text">
								{ helpText ??
									translate(
										'Please wait for a minute. If you didn’t receive it, we can {{button}}resend{{/button}} it.',
										translationArgs
									) }
							</div>
						</FormFieldset>
					) }
				</>
			) }

			<DashboardModalFormFooter>
				<Button onClick={ showCodeVerification ? onSaveLater : toggleModal }>
					{ showCodeVerification ? translate( 'Later' ) : translate( 'Back' ) }
				</Button>
				<Button disabled={ isDisabled } type="submit" primary>
					{ isRemoveAction ? translate( 'Remove' ) : verificationButtonTitle }
				</Button>
			</DashboardModalFormFooter>
		</DashboardModalForm>
	);
}
