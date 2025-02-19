import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import Form from 'calypso/a8c-for-agencies/components/form';
import FormField from 'calypso/a8c-for-agencies/components/form/field';
import FormFooter from 'calypso/a8c-for-agencies/components/form/footer';
import { AgencyDetailsSignupPayload } from 'calypso/a8c-for-agencies/sections/signup/types';
import QuerySmsCountries from 'calypso/components/data/query-countries/sms';
import FormPhoneInput from 'calypso/components/forms/form-phone-input';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { useGetSupportedSMSCountries } from 'calypso/jetpack-cloud/sections/agency-dashboard/downtime-monitoring/contact-editor/hooks';
import { preventWidows } from 'calypso/lib/formatting';
import useContactFormValidation from './hooks/use-contact-form-validation';
import TosModal from './tos-modal';

import './style.scss';

type Props = {
	onContinue: ( data: Partial< AgencyDetailsSignupPayload > ) => void;
	initialFormData: Partial< AgencyDetailsSignupPayload >;
};

const SignupContactForm = ( { onContinue, initialFormData }: Props ) => {
	const translate = useTranslate();
	const [ showTosModal, setShowTosModal ] = useState( false );
	const { validate, validationError, updateValidationError, isValidating } =
		useContactFormValidation();

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
			const error = await validate( formData );
			if ( error ) {
				return;
			}
			onContinue( formData );
		},
		[ formData, onContinue, validate ]
	);

	return (
		<Form
			className="signup-contact-form"
			title={ preventWidows(
				translate( `Sign up and unlock the blueprint to grow your agency's business` )
			) }
			description={ preventWidows(
				translate( 'Join 5000+ agencies and grow your business with Automattic for Agencies.' )
			) }
		>
			<div className="signup-multi-step-form__name-fields">
				<FormField
					error={ validationError.firstName }
					label={ translate( 'Your first name' ) }
					isRequired
				>
					<FormTextInput
						name="firstName"
						value={ formData.firstName }
						onChange={ handleInputChange( 'firstName' ) }
						placeholder={ translate( 'Your first name' ) }
					/>
				</FormField>

				<FormField error={ validationError.lastName } label={ translate( 'Last name' ) } isRequired>
					<FormTextInput
						name="lastName"
						value={ formData.lastName }
						onChange={ handleInputChange( 'lastName' ) }
						placeholder={ translate( 'Your last name' ) }
					/>
				</FormField>
			</div>

			<FormField error={ validationError.email } label={ translate( 'Email' ) } isRequired>
				<FormTextInput
					name="email"
					type="email"
					value={ formData.email }
					onChange={ handleInputChange( 'email' ) }
					placeholder={ translate( 'Your email' ) }
				/>
			</FormField>

			<FormField
				error={ validationError.agencyName }
				label={ translate( 'Agency name' ) }
				isRequired
			>
				<FormTextInput
					name="agencyName"
					value={ formData.agencyName }
					onChange={ handleInputChange( 'agencyName' ) }
					placeholder={ translate( 'Agency name' ) }
				/>
			</FormField>

			<FormField
				error={ validationError.agencyUrl }
				label={ translate( 'Business URL' ) }
				isRequired
			>
				<FormTextInput
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
					placeholder: translate( 'Phone number' ),
				} }
				initialCountryCode="US"
			/>
			<TosModal
				show={ showTosModal }
				onClose={ () => {
					setShowTosModal( false );
				} }
			/>

			<div className="signup-contact-form__tos">
				<p>
					{ translate(
						"By clicking 'Continue', you agree to the{{break}}{{/break}}{{link}}Terms of the Automattic for Agencies Platform Agreement ↗{{/link}}",
						{
							components: {
								break: <br />,
								link: (
									<button
										type="button"
										className="signup-contact-form__tos-link"
										onClick={ () => setShowTosModal( true ) }
									></button>
								),
							},
						}
					) }
				</p>
			</div>

			<FormFooter>
				<Button
					__next40pxDefaultSize
					disabled={ isValidating }
					variant="primary"
					onClick={ handleSubmit }
				>
					{ translate( 'Continue' ) }
				</Button>
			</FormFooter>
		</Form>
	);
};

export default SignupContactForm;
