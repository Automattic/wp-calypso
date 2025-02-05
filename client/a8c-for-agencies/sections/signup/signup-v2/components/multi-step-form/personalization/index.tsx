import { SearchableDropdown } from '@automattic/components';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState, ChangeEvent } from 'react';
import Form from 'calypso/a8c-for-agencies/components/form';
import FormField from 'calypso/a8c-for-agencies/components/form/field';
import { useCountriesAndStates } from 'calypso/a8c-for-agencies/sections/signup/agency-details-form/hooks/use-countries-and-states';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSelect from 'calypso/components/forms/form-select';
import MultiCheckbox from 'calypso/components/forms/multi-checkbox';

import './style.scss';

interface Props {
	onContinue: () => void;
}

export default function PersonalizationForm( { onContinue }: Props ) {
	const translate = useTranslate();
	const { countryOptions } = useCountriesAndStates();

	const [ country, setCountry ] = useState( '' );
	const [ userType, setUserType ] = useState( '' );
	const [ managedSites, setManagedSites ] = useState( '' );
	const [ servicesOffered, setServicesOffered ] = useState< string[] >( [] );
	const [ productsOffered, setProductsOffered ] = useState< string[] >( [] );

	const handleSetServicesOffered = ( services: { value: string[] } ) => {
		setServicesOffered( services.value );
	};

	const handleSetProductsOffered = ( products: { value: string[] } ) => {
		setProductsOffered( products.value );
	};

	const handleSubmit = async ( e: React.FormEvent ) => {
		e.preventDefault();

		onContinue();
	};

	return (
		<div className="signup-personalization-form">
			<Form
				className="a4a-form"
				title={ translate( 'Personalize your experience' ) }
				description={ translate( "We'll tailor the product and onboarding for you." ) }
			>
				<div className="signup-multi-step-form__fields">
					<FormFieldset>
						<FormField label={ translate( 'Where is your agency located?' ) } isRequired>
							<SearchableDropdown
								value={ country }
								onChange={ ( value ) => {
									setCountry( value ?? '' );
								} }
								options={ countryOptions }
								label={ translate( 'Select country' ) }
							/>
						</FormField>
					</FormFieldset>

					<FormFieldset>
						<FormField label={ translate( 'How would you describe yourself?' ) } isRequired>
							<FormSelect
								id="user_type"
								value={ userType }
								onChange={ ( e: ChangeEvent< HTMLSelectElement > ) => {
									setUserType( e.target.value );
								} }
							>
								<option value="">{ translate( 'Select option' ) }</option>
								<option value="agency_owner">{ translate( 'Agency owner' ) }</option>
								<option value="developer_at_agency">
									{ translate( 'Developer at an agency' ) }
								</option>
								<option value="sales_marketing_operations_at_agency">
									{ translate( 'Sales, marketing, or operations at an agency' ) }
								</option>
								<option value="freelancer">{ translate( 'Freelancer' ) }</option>
								<option value="site_owner">{ translate( 'Site owner' ) }</option>
							</FormSelect>
						</FormField>
					</FormFieldset>

					<FormFieldset>
						<FormField label={ translate( 'How many sites do you manage?' ) } isRequired>
							<FormSelect
								id="managed_sites"
								value={ managedSites }
								onChange={ ( e: ChangeEvent< HTMLSelectElement > ) => {
									setManagedSites( e.target.value );
								} }
							>
								<option value="">{ translate( 'Select option' ) }</option>
								<option value="1-5">{ translate( '1-5' ) }</option>
								<option value="6-20">{ translate( '6-20' ) }</option>
								<option value="21-50">{ translate( '21-50' ) }</option>
								<option value="50-100">{ translate( '50-100' ) }</option>
								<option value="101-500">{ translate( '101-500' ) }</option>
								<option value="500+">{ translate( '500+' ) }</option>
							</FormSelect>
						</FormField>
					</FormFieldset>

					<FormFieldset>
						<FormField label={ translate( 'What services do you offer?' ) } isRequired>
							<MultiCheckbox
								id="services_offered"
								name="services_offered"
								checked={ servicesOffered }
								options={ [
									{ value: 'strategy_consulting', label: translate( 'Strategy consulting' ) },
									{
										value: 'website_design_development',
										label: translate( 'Website design & development' ),
									},
									{
										value: 'performance_optimization',
										label: translate( 'Performance optimization' ),
									},
									{
										value: 'digital_strategy_marketing',
										label: translate( 'Digital strategy & marketing' ),
									},
									{
										value: 'maintenance_support_plans',
										label: translate( 'Maintenance & support plans' ),
									},
								] }
								onChange={ handleSetServicesOffered as any }
							/>
						</FormField>
					</FormFieldset>

					<FormFieldset className="signup-personalization-form__products-checkbox">
						<FormField
							label={ translate( 'What Automattic products do you currently offer your clients?' ) }
							isRequired
						>
							<MultiCheckbox
								id="products_offered"
								name="products_offered"
								checked={ productsOffered }
								options={ [
									{ value: 'WordPress.com', label: translate( 'WordPress.com' ) },
									{ value: 'WooCommerce', label: translate( 'WooCommerce' ) },
									{ value: 'Jetpack', label: translate( 'Jetpack' ) },
									{ value: 'Pressable', label: translate( 'Pressable' ) },
									{ value: 'WordPress VIP', label: translate( 'WordPress VIP' ) },
								] }
								onChange={ handleSetProductsOffered as any }
							/>
						</FormField>
					</FormFieldset>

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
		</div>
	);
}
