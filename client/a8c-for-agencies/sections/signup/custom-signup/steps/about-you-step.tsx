/**
 * PROTOTYPE — proof of concept only.
 *
 * Step 1a of `/custom-signup`: who's signing up.
 */
import { Button, ExternalLink } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import Form from 'calypso/a8c-for-agencies/components/form';
import FormField from 'calypso/a8c-for-agencies/components/form/field';
import FormFooter from 'calypso/a8c-for-agencies/components/form/footer';
import QuerySmsCountries from 'calypso/components/data/query-countries/sms';
import FormPhoneInput from 'calypso/components/forms/form-phone-input';
import FormSelect from 'calypso/components/forms/form-select';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { useGetSupportedSMSCountries } from 'calypso/jetpack-cloud/sections/agency-dashboard/downtime-monitoring/contact-editor/hooks';
import useDetailsStep from '../hooks/use-details-step';
import { getUserTypeOptions } from '../lib/options';
import type { DetailsField } from '../hooks/use-agency-details-validation';
import type { PrototypeSignupData } from '../lib/prototype-signup-data';

const REQUIRED_FIELDS: DetailsField[] = [ 'firstName', 'lastName', 'email' ];

type Props = {
	initialData: PrototypeSignupData;
	onContinue: ( data: PrototypeSignupData ) => void;
};

export default function AboutYouStep( { initialData, onContinue }: Props ) {
	const translate = useTranslate();
	const smsCountries = useGetSupportedSMSCountries();
	const { data, errors, update, onFieldChange, handleSubmit, formRef } = useDetailsStep(
		initialData,
		REQUIRED_FIELDS,
		onContinue
	);

	const textField = ( field: 'firstName' | 'lastName' | 'email', label: string, type = 'text' ) => (
		<FormField error={ errors[ field ] } label={ label } labelFor={ field }>
			<FormTextInput
				id={ field }
				name={ field }
				type={ type }
				value={ data[ field ] }
				onChange={ onFieldChange( field ) }
				placeholder={ label }
			/>
		</FormField>
	);

	return (
		<div ref={ formRef }>
			<Form
				className="a4a-custom-signup-step a4a-custom-signup-details"
				title={ translate( 'First, tell us about you' ) }
				description={ translate( 'Signing up is free and takes less than a minute.' ) }
				autocomplete="off"
			>
				{ textField( 'firstName', translate( 'First name' ) ) }
				{ textField( 'lastName', translate( 'Last name' ) ) }
				{ textField( 'email', translate( 'Work email' ), 'email' ) }

				<div className="a4a-custom-signup-phone">
					{ smsCountries.length === 0 && <QuerySmsCountries /> }
					<FormPhoneInput
						isDisabled={ smsCountries.length === 0 }
						countriesList={ smsCountries }
						onChange={ ( phone: { phoneNumber: string; countryData?: { code: string } } ) => {
							update( 'phoneNumber', phone.phoneNumber );
							update( 'phoneCountryCode', phone.countryData?.code ?? 'US' );
						} }
						phoneInputProps={ { id: 'phone_number', placeholder: translate( 'Phone number' ) } }
						countrySelectProps={ { id: 'country_code' } }
						initialCountryCode={ data.phoneCountryCode }
						initialPhoneNumber={ data.phoneNumber }
					/>
				</div>

				<div className="a4a-custom-signup-full-row">
					<FormField label={ translate( 'Your role' ) } labelFor="userType">
						<FormSelect
							id="userType"
							value={ data.userType }
							onChange={ onFieldChange( 'userType' ) }
						>
							{ getUserTypeOptions().map( ( option ) => (
								<option key={ option.value } value={ option.value }>
									{ option.label }
								</option>
							) ) }
						</FormSelect>
					</FormField>
				</div>

				<FormFooter>
					<div className="a4a-custom-signup-details-footer">
						<Button __next40pxDefaultSize variant="primary" onClick={ handleSubmit }>
							{ translate( 'Continue' ) }
						</Button>
						<p className="a4a-custom-signup-tos">
							{ translate(
								'By continuing, you agree to the {{link}}Automattic for Agencies Platform Agreement{{/link}}.',
								{
									components: {
										link: (
											<ExternalLink
												href="https://automattic.com/for-agencies/platform-agreement/"
												children={ null }
											/>
										),
									},
								}
							) }
						</p>
					</div>
				</FormFooter>
			</Form>
		</div>
	);
}
