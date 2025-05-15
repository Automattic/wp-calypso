import { SearchableDropdown } from '@automattic/components';
import { Button } from '@wordpress/components';
import { arrowLeft } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState, ChangeEvent, useMemo } from 'react';
import Form from 'calypso/a8c-for-agencies/components/form';
import FormField from 'calypso/a8c-for-agencies/components/form/field';
import FormFooter from 'calypso/a8c-for-agencies/components/form/footer';
import LayoutBanner from 'calypso/a8c-for-agencies/components/layout/banner';
import { useCountriesAndStates } from 'calypso/a8c-for-agencies/sections/signup/agency-details-form/hooks/use-countries-and-states';
import { AgencyDetailsSignupPayload } from 'calypso/a8c-for-agencies/sections/signup/types';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSelect from 'calypso/components/forms/form-select';
import MultiCheckbox from 'calypso/components/forms/multi-checkbox';
import { preventWidows } from 'calypso/lib/formatting';
import usePersonalizationFormValidation from './hooks/use-personalization-form-validation';

import './style.scss';

interface Props {
	onContinue: ( data: Partial< AgencyDetailsSignupPayload > ) => void;
	onSubmit?: ( data: Partial< AgencyDetailsSignupPayload > ) => void;
	goBack: () => void;
	initialFormData: Partial< AgencyDetailsSignupPayload >;
	isFinalStep?: boolean;
}

export default function PersonalizationForm( {
	onContinue,
	onSubmit,
	goBack,
	initialFormData,
	isFinalStep = false,
}: Props ) {
	const translate = useTranslate();
	const { countryOptions } = useCountriesAndStates();
	const { validate, validationError, updateValidationError } = usePersonalizationFormValidation();
	const [ isSubmitting, setIsSubmitting ] = useState( false );

	const [ formData, setFormData ] = useState< Partial< AgencyDetailsSignupPayload > >( {
		country: initialFormData.country || '',
		userType: initialFormData.userType || 'agency_owner',
		managedSites: initialFormData.managedSites || '1-5',
		servicesOffered: initialFormData.servicesOffered || [],
		productsOffered: initialFormData.productsOffered || [],
	} );

	const handleInputChange =
		( field: keyof AgencyDetailsSignupPayload ) => ( event: ChangeEvent< HTMLSelectElement > ) => {
			setFormData( ( prev ) => ( {
				...prev,
				[ field ]: event.target.value,
			} ) );
		};

	const handleSetServicesOffered = ( services: { value: string[] } ) => {
		setFormData( ( prev ) => ( {
			...prev,
			servicesOffered: services.value,
		} ) );
		updateValidationError( { servicesOffered: undefined } );
	};

	const handleSetProductsOffered = ( products: { value: string[] } ) => {
		setFormData( ( prev ) => ( {
			...prev,
			productsOffered: products.value,
		} ) );
		updateValidationError( { productsOffered: undefined } );
	};

	const servicesOfferedOptions = useMemo(
		() => [
			{ value: 'strategy_consulting', label: translate( 'Strategy consulting' ) },
			{ value: 'website_design_development', label: translate( 'Website design & development' ) },
			{ value: 'performance_optimization', label: translate( 'Performance optimization' ) },
			{ value: 'digital_strategy_marketing', label: translate( 'Digital strategy & marketing' ) },
			{ value: 'maintenance_support_plans', label: translate( 'Maintenance & support plans' ) },
			{ value: 'other', label: translate( 'Other' ) },
		],
		[ translate ]
	);

	const productsOfferedOptions = useMemo(
		() => [
			{ value: 'WordPress.com', label: translate( 'WordPress.com' ) },
			{ value: 'WooCommerce', label: translate( 'WooCommerce' ) },
			{ value: 'Jetpack', label: translate( 'Jetpack' ) },
			{ value: 'Pressable', label: translate( 'Pressable' ) },
			{ value: 'WordPress VIP', label: translate( 'WordPress VIP' ) },
			{ value: 'None', label: translate( 'None' ) },
		],
		[ translate ]
	);

	const handleSetCountry = ( value?: string | null ) => {
		if ( ! value ) {
			return;
		}

		setFormData( ( prev ) => ( {
			...prev,
			country: value,
		} ) );
		updateValidationError( { country: undefined } );
	};

	const handleSubmit = async ( e: React.FormEvent ) => {
		e.preventDefault();
		const error = await validate( formData );
		if ( error ) {
			return;
		}

		if ( isFinalStep ) {
			setIsSubmitting( true );
			onSubmit?.( formData );
		} else {
			onContinue( formData );
		}
	};

	const isUserSiteOwner = formData.userType === 'site_owner';

	return (
		<div className="signup-personalization-form">
			<Form
				className="a4a-form"
				title={ translate( 'Personalize your experience' ) }
				description={ translate(
					'Give us some details about your agency, so we can shape the Automattic for Agencies program to meet your specific needs and help grow your business.'
				) }
			>
				<div className="field-mandatory-message">
					{ translate( 'Fields marked with * are required' ) }
				</div>
				<FormFieldset>
					<FormField
						error={ validationError.country }
						label={ translate( 'Where is your agency located?' ) }
						isRequired
					>
						<SearchableDropdown
							value={ formData.country }
							onChange={ handleSetCountry }
							options={ countryOptions }
							placeholder={ translate( 'Select country' ) }
						/>
					</FormField>
				</FormFieldset>

				<FormFieldset>
					<FormField label={ translate( 'How would you describe yourself?' ) } isRequired>
						<FormSelect
							id="user_type"
							value={ formData.userType }
							onChange={ handleInputChange( 'userType' ) }
						>
							<option value="agency_owner">{ translate( 'Agency owner' ) }</option>
							<option value="developer_at_agency">{ translate( 'Developer at an agency' ) }</option>
							<option value="sales_marketing_operations_at_agency">
								{ translate( 'Sales, marketing, or operations at an agency' ) }
							</option>
							<option value="freelancer">{ translate( 'Freelancer' ) }</option>
							<option value="site_owner">{ translate( 'Site owner' ) }</option>
						</FormSelect>
					</FormField>
				</FormFieldset>

				{ ! isUserSiteOwner ? (
					<>
						<FormFieldset>
							<FormField label={ translate( 'How many sites do you manage?' ) } isRequired>
								<FormSelect
									id="managed_sites"
									value={ formData.managedSites }
									onChange={ handleInputChange( 'managedSites' ) }
								>
									<option value="1-5">{ translate( '1-5' ) }</option>
									<option value="6-20">{ translate( '6-20' ) }</option>
									<option value="21-50">{ translate( '21-50' ) }</option>
									<option value="51-100">{ translate( '51-100' ) }</option>
									<option value="101-500">{ translate( '101-500' ) }</option>
									<option value="500+">{ translate( '500+' ) }</option>
								</FormSelect>
							</FormField>
						</FormFieldset>

						<FormFieldset className="signup-personalization-form__checkbox">
							<FormField
								error={ validationError.servicesOffered }
								label={ translate( 'What services do you offer?' ) }
								isRequired
							>
								<MultiCheckbox
									id="services_offered"
									name="services_offered"
									checked={ formData.servicesOffered }
									options={ servicesOfferedOptions }
									onChange={ handleSetServicesOffered as any }
								/>
							</FormField>
						</FormFieldset>

						<FormFieldset className="signup-personalization-form__checkbox">
							<FormField
								error={ validationError.productsOffered }
								label={ translate(
									'What Automattic products do you currently offer your clients?'
								) }
								isRequired
							>
								<MultiCheckbox
									id="products_offered"
									name="products_offered"
									checked={ formData.productsOffered }
									options={ productsOfferedOptions }
									onChange={ handleSetProductsOffered as any }
								/>
							</FormField>
						</FormFieldset>

						{ isFinalStep && (
							<span className="signup-personalization-form__description">
								{ translate(
									"Next, we'll link your WordPress.com account to your agency dashboard. If you don't have an account you can create one on the next screen."
								) }
							</span>
						) }

						<FormFooter>
							<Button
								className="signup-multi-step-form__back-button"
								variant="tertiary"
								onClick={ goBack }
								icon={ arrowLeft }
								iconSize={ 18 }
							>
								{ translate( 'Back' ) }
							</Button>

							<Button
								__next40pxDefaultSize
								variant="primary"
								onClick={ handleSubmit }
								isBusy={ isSubmitting }
							>
								{ isFinalStep ? translate( 'Finish and Log in' ) : translate( 'Continue' ) }
							</Button>
						</FormFooter>
					</>
				) : (
					<LayoutBanner
						hideCloseButton
						level="warning"
						title={ preventWidows(
							translate( 'It seems like we might not be the perfect match right now.' )
						) }
					>
						<div>
							{ preventWidows(
								translate(
									'Automattic for Agencies is a program designed for agencies, developers, and freelancers who work with and provide services to their clients.' +
										" Depending on what you are looking for, you may want to check out one of our individual products, like {{wp}}WordPress.com{{/wp}}, {{pressable}}Pressable.com{{/pressable}}, {{woo}}Woo.com{{/woo}}, {{jetpack}}Jetpack.com{{/jetpack}}. If you really aren't sure where to go, feel free to contact us at {{email}}partnerships@automattic.com{{/email}} and we'll point you in the right direction.",
									{
										components: {
											wp: <a href="https://wordpress.com" target="_blank" rel="noreferrer" />,
											pressable: (
												<a href="https://pressable.com" target="_blank" rel="noreferrer" />
											),
											woo: <a href="https://woocommerce.com" target="_blank" rel="noreferrer" />,
											jetpack: <a href="https://jetpack.com" target="_blank" rel="noreferrer" />,
											email: <a href="mailto:partnerships@automattic.com" />,
										},
									}
								)
							) }
						</div>
					</LayoutBanner>
				) }
			</Form>
		</div>
	);
}
