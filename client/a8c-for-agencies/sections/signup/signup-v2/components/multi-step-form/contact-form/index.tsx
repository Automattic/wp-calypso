import {
	Button,
	Modal,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import Form from 'calypso/a8c-for-agencies/components/form';
import FormField from 'calypso/a8c-for-agencies/components/form/field';
import FormFooter from 'calypso/a8c-for-agencies/components/form/footer';
import {
	isAgencyNameExists,
	isAgencyUrlExists,
} from 'calypso/a8c-for-agencies/components/form/utils';
import { AgencyDetailsSignupPayload } from 'calypso/a8c-for-agencies/sections/signup/types';
import QuerySmsCountries from 'calypso/components/data/query-countries/sms';
import FormPhoneInput from 'calypso/components/forms/form-phone-input';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { ButtonStack } from 'calypso/dashboard/components/button-stack';
import { useGetSupportedSMSCountries } from 'calypso/jetpack-cloud/sections/agency-dashboard/downtime-monitoring/contact-editor/hooks';
import { preventWidows } from 'calypso/lib/formatting';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import useContactFormValidation from './hooks/use-contact-form-validation';

import './style.scss';

type Props = {
	onContinue: ( data: Partial< AgencyDetailsSignupPayload > ) => void;
	initialFormData: Partial< AgencyDetailsSignupPayload >;
	withEmail?: boolean;
};

const SignupContactForm = ( { onContinue, initialFormData, withEmail = false }: Props ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { validate, validationError, updateValidationError } = useContactFormValidation( {
		withEmail,
	} );

	const [ isProcessing, setIsProceeding ] = useState( false );

	const countriesList = useGetSupportedSMSCountries();
	const noCountryList = countriesList.length === 0;

	const [ formData, setFormData ] = useState< Partial< AgencyDetailsSignupPayload > >( {
		firstName: initialFormData.firstName || '',
		lastName: initialFormData.lastName || '',
		email: initialFormData.email || '',
		agencyName: initialFormData.agencyName || '',
		agencyUrl: initialFormData.agencyUrl || '',
		phoneNumber: initialFormData.phoneNumber || '',
	} );

	const [ duplicateAgencyFields, setDuplicateAgencyFields ] = useState< {
		agencyName: boolean;
		agencyUrl: boolean;
	} >( {
		agencyName: false,
		agencyUrl: false,
	} );

	const handlePhoneInputChange = ( data: { phoneNumberFull: string } ) => {
		setFormData( ( prev ) => ( {
			...prev,
			phoneNumber: data.phoneNumberFull,
		} ) );
	};

	const handleInputChange =
		( field: keyof AgencyDetailsSignupPayload ) =>
		( event: React.ChangeEvent< HTMLInputElement > ) => {
			setFormData( ( prev ) => ( {
				...prev,
				[ field ]: event.target.value,
			} ) );
			updateValidationError( { [ field ]: undefined } );
		};

	const handleSubmit = useCallback(
		async ( e: React.FormEvent ) => {
			e.preventDefault();
			setIsProceeding( true );
			const error = await validate( formData );
			if ( error ) {
				setIsProceeding( false );
				return;
			}

			try {
				const [ duplicateAgencyName, duplicateURL ] = await Promise.all( [
					isAgencyNameExists( formData.agencyName ?? '' ),
					isAgencyUrlExists( formData.agencyUrl ?? '' ),
				] );

				setDuplicateAgencyFields( {
					agencyName: duplicateAgencyName,
					agencyUrl: duplicateURL,
				} );

				if ( ! duplicateAgencyName && ! duplicateURL ) {
					onContinue( formData );
				} else {
					// Fire track event to track the view of the duplicate agency warning dialog
					dispatch(
						recordTracksEvent(
							'calypso_a4a_agency_signup_form_duplicate_agency_warning_dialog_view',
							{
								agencyName: formData.agencyName ?? '',
								agencyUrl: formData.agencyUrl ?? '',
							}
						)
					);
				}
			} catch ( error ) {
				// In case the verification fails, we just let the user continue with the form submission.
				onContinue( formData );
			} finally {
				setIsProceeding( false );
			}
		},
		[ validate, formData, onContinue, dispatch ]
	);

	const closeDuplicateAgencyWarning = () => {
		setDuplicateAgencyFields( { agencyName: false, agencyUrl: false } );
	};

	return (
		<Form
			className="signup-contact-form"
			title={ preventWidows(
				translate( "Sign up and unlock the blueprint to grow your agency's business" )
			) }
			description={ preventWidows(
				translate(
					'Join 6000+ agencies and grow your business with {{span}}Automattic for Agencies.{{/span}} Get access to site management, earn commission on referrals, and explore our tier program to launch your business potential.',
					{
						components: {
							span: <span className="signup-contact-form__a4a-span" />,
						},
					}
				)
			) }
		>
			<div className="field-mandatory-message">
				{ translate( 'Fields marked with * are required' ) }
			</div>
			<div className="signup-multi-step-form__name-fields">
				<FormField
					error={ validationError.firstName }
					label={ translate( 'Your first name' ) }
					labelFor="firstName"
					isRequired
				>
					<FormTextInput
						id="firstName"
						name="firstName"
						value={ formData.firstName }
						onChange={ handleInputChange( 'firstName' ) }
						placeholder={ translate( 'Your first name' ) }
					/>
				</FormField>

				<FormField
					error={ validationError.lastName }
					label={ translate( 'Last name' ) }
					labelFor="lastName"
					isRequired
				>
					<FormTextInput
						id="lastName"
						name="lastName"
						value={ formData.lastName }
						onChange={ handleInputChange( 'lastName' ) }
						placeholder={ translate( 'Your last name' ) }
					/>
				</FormField>
			</div>

			{ withEmail && (
				<FormField
					error={ validationError.email }
					label={ translate( 'Email' ) }
					labelFor="email"
					isRequired
				>
					<FormTextInput
						id="email"
						name="email"
						type="email"
						value={ formData.email }
						onChange={ handleInputChange( 'email' ) }
						placeholder={ translate( 'Your email' ) }
					/>
				</FormField>
			) }

			<FormField
				error={ validationError.agencyName }
				label={ translate( 'Agency name' ) }
				labelFor="agencyName"
				isRequired
			>
				<FormTextInput
					id="agencyName"
					name="agencyName"
					value={ formData.agencyName }
					onChange={ handleInputChange( 'agencyName' ) }
					placeholder={ translate( 'Agency name' ) }
				/>
			</FormField>

			<FormField
				error={ validationError.agencyUrl }
				label={ translate( 'Business URL' ) }
				labelFor="agencyUrl"
				isRequired
			>
				<FormTextInput
					id="agencyUrl"
					name="agencyUrl"
					value={ formData.agencyUrl }
					onChange={ handleInputChange( 'agencyUrl' ) }
					placeholder={ translate( 'Business URL' ) }
				/>
			</FormField>

			{ noCountryList && <QuerySmsCountries /> }

			<FormPhoneInput
				isDisabled={ noCountryList }
				countriesList={ countriesList }
				onChange={ handlePhoneInputChange }
				className="contact-form__phone-input"
				phoneInputProps={ {
					id: 'phone_number',
					placeholder: translate( 'Phone number' ),
				} }
				countrySelectProps={ {
					id: 'country_code',
				} }
				initialCountryCode="US"
			/>

			<div className="signup-contact-form__tos">
				<p>
					{ translate(
						"By clicking 'Continue', you agree to the{{break}}{{/break}}{{link}}Terms of the Automattic for Agencies Platform Agreement{{/link}} ↗",
						{
							components: {
								break: <br />,
								link: (
									<a
										href="https://automattic.com/for-agencies/platform-agreement/"
										className="signup-contact-form__tos-link"
										target="_blank"
										rel="noopener noreferrer"
									></a>
								),
							},
						}
					) }
				</p>
			</div>

			<FormFooter>
				<Button
					__next40pxDefaultSize
					disabled={ isProcessing }
					variant="primary"
					onClick={ handleSubmit }
				>
					{ translate( 'Continue for free' ) }
				</Button>
			</FormFooter>

			{ ( duplicateAgencyFields.agencyName || duplicateAgencyFields.agencyUrl ) && (
				<Modal
					isDismissible
					size="medium"
					onRequestClose={ () =>
						setDuplicateAgencyFields( { agencyName: false, agencyUrl: false } )
					}
					title={ translate( 'Duplicate Agency' ) }
				>
					<VStack spacing={ 8 }>
						{ duplicateAgencyFields.agencyName ? (
							<Text>
								{ translate(
									'An agency with the name {{b}}%(agencyName)s{{/b}} already exists. Do you want to proceed with creating a new agency account? Alternatively, ask your team for an invite.',
									{
										args: {
											agencyName: formData.agencyName ?? '',
										},
										components: {
											b: <b />,
										},
									}
								) }
							</Text>
						) : (
							<Text>
								{ translate(
									'An agency with the domain {{b}}%(agencyUrl)s{{/b}} already exists. Do you want to proceed with creating a new agency account? Alternatively, ask your team for an invite.',
									{
										args: {
											agencyUrl: formData.agencyUrl ?? '',
										},
										components: {
											b: <b />,
										},
									}
								) }
							</Text>
						) }
						<ButtonStack justify="flex-end">
							<Button variant="secondary" onClick={ closeDuplicateAgencyWarning }>
								{ translate( 'Cancel' ) }
							</Button>
							<Button
								variant="primary"
								onClick={ () => {
									onContinue( formData );
									closeDuplicateAgencyWarning();
								} }
							>
								{ translate( 'Continue creating new agency account' ) }
							</Button>
						</ButtonStack>
					</VStack>
				</Modal>
			) }
		</Form>
	);
};

export default SignupContactForm;
