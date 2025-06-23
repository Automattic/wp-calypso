import { useTranslate } from 'i18n-calypso';
import { ChangeEvent } from 'react';
import Form from 'calypso/a8c-for-agencies/components/form';
import FormField from 'calypso/a8c-for-agencies/components/form/field';
import FormSection from 'calypso/a8c-for-agencies/components/form/section';
import FormTextInput from 'calypso/components/forms/form-text-input';
import useReferEnterpriseHostingForm from './hooks/use-refer-enterprise-hosting-form';

export default function ReferEnterpriseHostingForm() {
	const translate = useTranslate();

	const { formData, updateFormData, validationError, updateValidationError } =
		useReferEnterpriseHostingForm();

	const handleInputChange = ( name: string, value: string | string[] | boolean ) => {
		updateFormData( name, value );
		updateValidationError( { [ name ]: '' } );
	};

	return (
		<Form
			className="refer-enterprise-hosting-form"
			title={ translate( 'Submit WordPress VIP referral' ) }
			autocomplete="off"
			description={ translate(
				'Once submitted, our team will take it from there. We will keep you informed of our progress along the way. All fields are required unless marked as optional'
			) }
		>
			<FormSection title={ translate( 'End user company information' ) }>
				<FormField
					label={ translate( 'Company name' ) }
					labelFor="companyName"
					error={ validationError.companyName }
				>
					<FormTextInput
						id="companyName"
						name="companyName"
						value={ formData.companyName }
						onChange={ ( e: ChangeEvent< HTMLInputElement > ) =>
							handleInputChange( 'companyName', e.target.value )
						}
					/>
				</FormField>

				<FormField
					label={ translate( 'Company address' ) }
					labelFor="address"
					error={ validationError.address }
				>
					<FormTextInput
						id="address"
						name="address"
						value={ formData.address }
						onChange={ ( e: ChangeEvent< HTMLInputElement > ) =>
							handleInputChange( 'address', e.target.value )
						}
					/>
				</FormField>

				<FormField
					label={ translate( 'Country code' ) }
					labelFor="countryCode"
					error={ validationError.countryCode }
				>
					<FormTextInput
						id="countryCode"
						name="countryCode"
						value={ formData.countryCode }
						onChange={ ( e: ChangeEvent< HTMLInputElement > ) =>
							handleInputChange( 'countryCode', e.target.value )
						}
					/>
				</FormField>

				<FormField label={ translate( 'State/Province Code (optional)' ) } labelFor="state">
					<FormTextInput
						id="state"
						name="state"
						value={ formData.state }
						onChange={ ( e: ChangeEvent< HTMLInputElement > ) =>
							handleInputChange( 'state', e.target.value )
						}
					/>
				</FormField>

				<FormField label={ translate( 'City' ) } labelFor="city" error={ validationError.city }>
					<FormTextInput
						id="city"
						name="city"
						value={ formData.city }
						onChange={ ( e: ChangeEvent< HTMLInputElement > ) =>
							handleInputChange( 'city', e.target.value )
						}
					/>
				</FormField>

				<FormField
					label={ translate( 'ZIP/Postal code' ) }
					labelFor="zip"
					error={ validationError.zip }
				>
					<FormTextInput
						id="zip"
						name="zip"
						value={ formData.zip }
						onChange={ ( e: ChangeEvent< HTMLInputElement > ) =>
							handleInputChange( 'zip', e.target.value )
						}
					/>
				</FormField>
			</FormSection>
			<FormSection title={ translate( 'End user contact information' ) }>
				<div className="refer-enterprise-hosting-form__contact-name">
					<FormField
						label={ translate( 'First name' ) }
						labelFor="firstName"
						error={ validationError.firstName }
					>
						<FormTextInput
							id="firstName"
							name="firstName"
							value={ formData.firstName }
							onChange={ ( e: ChangeEvent< HTMLInputElement > ) =>
								handleInputChange( 'firstName', e.target.value )
							}
						/>
					</FormField>

					<FormField
						label={ translate( 'Last name' ) }
						labelFor="lastName"
						error={ validationError.lastName }
					>
						<FormTextInput
							id="lastName"
							name="lastName"
							value={ formData.lastName }
							onChange={ ( e: ChangeEvent< HTMLInputElement > ) =>
								handleInputChange( 'lastName', e.target.value )
							}
						/>
					</FormField>
				</div>

				<FormField label={ translate( 'Title' ) } labelFor="title" error={ validationError.title }>
					<FormTextInput
						id="title"
						name="title"
						value={ formData.title }
						onChange={ ( e: ChangeEvent< HTMLInputElement > ) =>
							handleInputChange( 'title', e.target.value )
						}
					/>
				</FormField>

				<FormField
					label={ translate( 'Phone (optional)' ) }
					labelFor="phone"
					error={ validationError.phone }
				>
					<FormTextInput
						id="phone"
						name="phone"
						value={ formData.phone }
						onChange={ ( e: ChangeEvent< HTMLInputElement > ) =>
							handleInputChange( 'phone', e.target.value )
						}
					/>
				</FormField>

				<FormField label={ translate( 'Email' ) } labelFor="email" error={ validationError.email }>
					<FormTextInput
						id="email"
						name="email"
						value={ formData.email }
						onChange={ ( e: ChangeEvent< HTMLInputElement > ) =>
							handleInputChange( 'email', e.target.value )
						}
					/>
				</FormField>

				<FormField
					label={ translate( 'Website' ) }
					labelFor="website"
					error={ validationError.website }
				>
					<FormTextInput
						id="website"
						name="website"
						value={ formData.website }
						onChange={ ( e: ChangeEvent< HTMLInputElement > ) =>
							handleInputChange( 'website', e.target.value )
						}
					/>
				</FormField>
			</FormSection>
			<FormSection title={ translate( 'Opportunity information' ) }>test</FormSection>
		</Form>
	);
}
