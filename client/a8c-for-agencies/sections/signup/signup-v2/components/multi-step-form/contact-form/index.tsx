import { localizeUrl } from '@automattic/i18n-utils';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import Form from 'calypso/a8c-for-agencies/components/form';
import FormField from 'calypso/a8c-for-agencies/components/form/field';
import FormFooter from 'calypso/a8c-for-agencies/components/form/footer';
import { AgencyDetailsSignupPayload } from 'calypso/a8c-for-agencies/sections/signup/types';
import QuerySmsCountries from 'calypso/components/data/query-countries/sms';
import FormPhoneInput from 'calypso/components/forms/form-phone-input';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { useGetSupportedSMSCountries } from 'calypso/jetpack-cloud/sections/agency-dashboard/downtime-monitoring/contact-editor/hooks';
import { preventWidows } from 'calypso/lib/formatting';

import './style.scss';

type Props = {
	onContinue: ( data: Partial< AgencyDetailsSignupPayload > ) => void;
};

const SignupContactForm = ( { onContinue }: Props ) => {
	const translate = useTranslate();

	const countriesList = useGetSupportedSMSCountries();
	const noCountryList = countriesList.length === 0;

	const [ formData, setFormData ] = useState< Partial< AgencyDetailsSignupPayload > >( {
		firstName: '',
		lastName: '',
		email: '',
		agencyName: '',
		agencyUrl: '',
		phoneNumber: '',
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
		};

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		onContinue( formData );
	};

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
				<FormField label={ translate( 'Your first name' ) } isRequired>
					<FormTextInput
						name="firstName"
						value={ formData.firstName }
						onChange={ handleInputChange( 'firstName' ) }
						placeholder={ translate( 'Your first name' ) }
					/>
				</FormField>

				<FormField label={ translate( 'Last name' ) } isRequired>
					<FormTextInput
						name="lastName"
						value={ formData.lastName }
						onChange={ handleInputChange( 'lastName' ) }
						placeholder={ translate( 'Your last name' ) }
					/>
				</FormField>
			</div>

			<FormField label={ translate( 'Email' ) } isRequired>
				<FormTextInput
					name="email"
					type="email"
					value={ formData.email }
					onChange={ handleInputChange( 'email' ) }
					placeholder={ translate( 'Your email' ) }
				/>
			</FormField>

			<FormField label={ translate( 'Agency name' ) } isRequired>
				<FormTextInput
					name="agencyName"
					value={ formData.agencyName }
					onChange={ handleInputChange( 'agencyName' ) }
					placeholder={ translate( 'Agency name' ) }
				/>
			</FormField>

			<FormField label={ translate( 'Business URL' ) } isRequired>
				<FormTextInput
					name="agencyUrl"
					value={ formData.agencyUrl }
					onChange={ handleInputChange( 'agencyUrl' ) }
					placeholder={ translate( 'Business URL' ) }
				/>
			</FormField>

			{ noCountryList && <QuerySmsCountries /> }

			<FormField label={ translate( 'Phone number' ) } showOptionalLabel>
				<FormPhoneInput
					isDisabled={ noCountryList }
					countriesList={ countriesList }
					onChange={ handlePhoneInputChange }
					className="contact-form__phone-input"
					phoneInputProps={ {
						placeholder: translate( 'Phone number' ),
					} }
				/>
			</FormField>

			<div className="signup-contact-form__tos">
				<p>
					{ translate(
						"By clicking 'Continue', you agree to the{{break}}{{/break}}{{link}}Terms of the Automattic for Agencies Platform Agreement ↗{{/link}}",
						{
							components: {
								break: <br />,
								link: (
									<a
										href={ localizeUrl(
											'https://automattic.com/for-agencies/platform-agreement/'
										) }
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
				<Button __next40pxDefaultSize variant="primary" onClick={ handleSubmit }>
					{ translate( 'Continue' ) }
				</Button>
			</FormFooter>
		</Form>
	);
};

export default SignupContactForm;
