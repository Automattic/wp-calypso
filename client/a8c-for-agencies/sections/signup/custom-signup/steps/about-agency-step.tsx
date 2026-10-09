/**
 * PROTOTYPE — proof of concept only.
 *
 * Step 1b of `/custom-signup`: the agency itself.
 */
import { SearchableDropdown } from '@automattic/components';
import { Button } from '@wordpress/components';
import { arrowLeft } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import Form from 'calypso/a8c-for-agencies/components/form';
import FormField from 'calypso/a8c-for-agencies/components/form/field';
import FormFooter from 'calypso/a8c-for-agencies/components/form/footer';
import { useCountriesAndStates } from 'calypso/a8c-for-agencies/sections/signup/agency-details-form/hooks/use-countries-and-states';
import FormSelect from 'calypso/components/forms/form-select';
import FormTextInput from 'calypso/components/forms/form-text-input';
import ChoiceCards from '../components/choice-cards';
import useDetailsStep from '../hooks/use-details-step';
import {
	AGENCY_SIZE_OPTIONS,
	MANAGED_SITES_OPTIONS,
	getServicesOfferedOptions,
} from '../lib/options';
import type { DetailsField } from '../hooks/use-agency-details-validation';
import type { PrototypeSignupData } from '../lib/prototype-signup-data';

const REQUIRED_FIELDS: DetailsField[] = [ 'agencyName', 'agencyUrl', 'country' ];

type Props = {
	initialData: PrototypeSignupData;
	onContinue: ( data: PrototypeSignupData ) => void;
	onBack: ( data: PrototypeSignupData ) => void;
};

export default function AboutAgencyStep( { initialData, onContinue, onBack }: Props ) {
	const translate = useTranslate();
	const { countryOptions } = useCountriesAndStates();
	const { data, errors, update, onFieldChange, handleSubmit, formRef } = useDetailsStep(
		initialData,
		REQUIRED_FIELDS,
		onContinue
	);

	const textField = ( field: 'agencyName' | 'agencyUrl', label: string ) => (
		<FormField error={ errors[ field ] } label={ label } labelFor={ field }>
			<FormTextInput
				id={ field }
				name={ field }
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
				title={ translate( 'Now, tell us about your agency' ) }
				description={ translate( 'This helps us match you with the right benefits.' ) }
				autocomplete="off"
			>
				{ textField( 'agencyName', translate( 'Agency name' ) ) }
				{ textField( 'agencyUrl', translate( 'Business URL' ) ) }

				<div className="a4a-custom-signup-full-row">
					<FormField error={ errors.country } label={ translate( 'Agency location' ) }>
						<SearchableDropdown
							value={ data.country }
							onChange={ ( value?: string | null ) => value && update( 'country', value ) }
							options={ countryOptions }
							placeholder={ translate( 'Select country' ) }
						/>
					</FormField>
				</div>

				<FormField label={ translate( 'Team size' ) } labelFor="agencySize">
					<FormSelect
						id="agencySize"
						value={ data.agencySize }
						onChange={ onFieldChange( 'agencySize' ) }
					>
						{ AGENCY_SIZE_OPTIONS.map( ( option ) => (
							<option key={ option } value={ option }>
								{ translate( '%(count)s people', { args: { count: option } } ) }
							</option>
						) ) }
					</FormSelect>
				</FormField>

				<FormField label={ translate( 'Sites you manage' ) } labelFor="managedSites">
					<FormSelect
						id="managedSites"
						value={ data.managedSites }
						onChange={ onFieldChange( 'managedSites' ) }
					>
						{ MANAGED_SITES_OPTIONS.map( ( option ) => (
							<option key={ option } value={ option }>
								{ translate( '%(count)s sites', { args: { count: option } } ) }
							</option>
						) ) }
					</FormSelect>
				</FormField>

				<div className="a4a-custom-signup-full-row">
					<FormField label={ translate( 'Services you offer' ) }>
						<ChoiceCards
							variant="chips"
							label={ translate( 'Services you offer' ) }
							options={ getServicesOfferedOptions() }
							value={ data.servicesOffered }
							onChange={ ( value ) => update( 'servicesOffered', value ) }
						/>
					</FormField>
				</div>

				<FormFooter>
					<div className="a4a-custom-signup-step-actions">
						<Button
							className="a4a-custom-signup-back-button"
							variant="tertiary"
							icon={ arrowLeft }
							onClick={ () => onBack( data ) }
						>
							{ translate( 'Back' ) }
						</Button>
						<Button __next40pxDefaultSize variant="primary" onClick={ handleSubmit }>
							{ translate( 'Continue' ) }
						</Button>
					</div>
				</FormFooter>
			</Form>
		</div>
	);
}
