import { Gridicon } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import Form from 'calypso/a8c-for-agencies/components/form';
import FormField from 'calypso/a8c-for-agencies/components/form/field';
import QuerySmsCountries from 'calypso/components/data/query-countries/sms';
import FormPhoneInput from 'calypso/components/forms/form-phone-input';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { useGetSupportedSMSCountries } from 'calypso/jetpack-cloud/sections/agency-dashboard/downtime-monitoring/contact-editor/hooks';

import './style.scss';

type FormData = {
	firstName: string;
	lastName: string;
	email: string;
	agencyName: string;
	businessUrl: string;
	phoneNumber: string;
};

type Props = {
	onContinue: () => void;
};

const SignupContactForm = ( { onContinue }: Props ) => {
	const translate = useTranslate();

	const countriesList = useGetSupportedSMSCountries();
	const noCountryList = countriesList.length === 0;

	const [ formData, setFormData ] = useState< FormData >( {
		firstName: '',
		lastName: '',
		email: '',
		agencyName: '',
		businessUrl: '',
		phoneNumber: '',
	} );

	const handlePhoneInputChange = ( data: { phoneNumberFull: string } ) => {
		setFormData( ( prev ) => ( {
			...prev,
			phoneNumber: data.phoneNumberFull,
		} ) );
	};

	const handleInputChange =
		( field: keyof FormData ) => ( event: React.ChangeEvent< HTMLInputElement > ) => {
			setFormData( ( prev ) => ( {
				...prev,
				[ field ]: event.target.value,
			} ) );
		};

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		onContinue();
	};

	return (
		<Form
			className="signup-contact-form"
			title={ translate( `Sign up and unlock the blueprint to grow your agency's business` ) }
			description={ translate(
				'Join 5000+ agencies and grow your business with Automattic for Agencies.'
			) }
		>
			<div className="signup-multi-step-form__fields">
				<div className="signup-multi-step-form__name-fields">
					<FormField label={ translate( 'Your first name' ) } isRequired>
						<FormTextInput
							name="firstName"
							value={ formData.firstName }
							onChange={ handleInputChange( 'firstName' ) }
						/>
					</FormField>

					<FormField label={ translate( 'Last name' ) } isRequired>
						<FormTextInput
							name="lastName"
							value={ formData.lastName }
							onChange={ handleInputChange( 'lastName' ) }
						/>
					</FormField>
				</div>

				<FormField label={ translate( 'Email' ) } isRequired>
					<FormTextInput
						name="email"
						type="email"
						value={ formData.email }
						onChange={ handleInputChange( 'email' ) }
					/>
				</FormField>

				<FormField label={ translate( 'Agency name' ) } isRequired>
					<FormTextInput
						name="agencyName"
						value={ formData.agencyName }
						onChange={ handleInputChange( 'agencyName' ) }
					/>
				</FormField>

				<FormField label={ translate( 'Business URL' ) } isRequired>
					<FormTextInput
						name="businessUrl"
						value={ formData.businessUrl }
						onChange={ handleInputChange( 'businessUrl' ) }
					/>
				</FormField>

				{ noCountryList && <QuerySmsCountries /> }

				<FormField label={ translate( 'Phone number' ) } showOptionalLabel>
					<FormPhoneInput
						isDisabled={ noCountryList }
						countriesList={ countriesList }
						onChange={ handlePhoneInputChange }
						className="contact-form__phone-input"
					/>
				</FormField>

				<div className="signup-contact-form__tos">
					<p>
						{ translate(
							"By clicking 'Continue', you agree to the{{break}}{{/break}}{{link}}Terms of the Automattic for Agencies Platform Agreement{{icon}}{{/icon}}{{/link}}.",
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
									icon: <Gridicon icon="external" size={ 18 } />,
								},
							}
						) }
					</p>
				</div>
				<div className="company-details-form__controls">
					<Button
						variant="primary"
						onClick={ handleSubmit }
						className="company-details-form__submit"
					>
						{ translate( 'Continue' ) }
					</Button>
				</div>
			</div>
		</Form>
	);
};

export default SignupContactForm;
