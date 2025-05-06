import { SearchableDropdown } from '@automattic/components';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { ChangeEvent, useCallback, useMemo, useState } from 'react';
import Form from 'calypso/a8c-for-agencies/components/form';
import FormField from 'calypso/a8c-for-agencies/components/form/field';
import FormFooter from 'calypso/a8c-for-agencies/components/form/footer';
import LayoutBanner from 'calypso/a8c-for-agencies/components/layout/banner';
import { AgencyDetailsSignupPayload } from 'calypso/a8c-for-agencies/sections/signup/types';
import QuerySmsCountries from 'calypso/components/data/query-countries/sms';
import FormPhoneInput from 'calypso/components/forms/form-phone-input';
import FormSelect from 'calypso/components/forms/form-select';
import FormTextInput from 'calypso/components/forms/form-text-input';
import MultiCheckbox from 'calypso/components/forms/multi-checkbox';
import { useGetSupportedSMSCountries } from 'calypso/jetpack-cloud/sections/agency-dashboard/downtime-monitoring/contact-editor/hooks';
import { useCountriesAndStates } from 'calypso/jetpack-cloud/sections/partner-portal/company-details-form/hooks/use-countries-and-states';
import { preventWidows } from 'calypso/lib/formatting';
import { AgencyDetailsPayload } from '../../../agency-details-form/types';
import useSimpleFormValidation from './hooks/use-simple-form-validation';
import TosModal from './tos-modal';

import './style.scss';

type Props = {
	initialValues?: AgencyDetailsPayload;
	referer?: string | null;
	onSubmit: ( payload: AgencyDetailsPayload ) => void;
};

const SimpleForm = ( { initialValues, onSubmit, referer }: Props ) => {
	const translate = useTranslate();
	const [ showTosModal, setShowTosModal ] = useState( false );
	const { validate, validationError, updateValidationError, isValidating } =
		useSimpleFormValidation();

	const countriesList = useGetSupportedSMSCountries();
	const { countryOptions, stateOptionsMap } = useCountriesAndStates();
	const noCountryList = countriesList.length === 0;
	const [ formData, setFormData ] = useState< AgencyDetailsPayload >( {
		firstName: initialValues?.firstName ?? '',
		lastName: initialValues?.lastName ?? '',
		agencyName: initialValues?.agencyName ?? '',
		agencyUrl: initialValues?.agencyUrl ?? '',
		userType: initialValues?.userType ?? 'agency_owner',
		managedSites: initialValues?.managedSites ?? '1-5',
		servicesOffered: initialValues?.servicesOffered ?? [],
		productsOffered: initialValues?.productsOffered ?? [],
		country: initialValues?.country ?? '',
		state: initialValues?.state ?? '',
		line1: initialValues?.line1 ?? '',
		line2: initialValues?.line2 ?? '',
		city: initialValues?.city ?? '',
		postalCode: initialValues?.postalCode ?? '',
		phone: initialValues?.phone ?? {},
		tos: 'consented',
		referer,
	} );

	const handlePhoneInputChange = ( data: { phoneNumberFull: string } ) => {
		setFormData( ( prev ) => ( {
			...prev,
			phoneNumber: data.phoneNumberFull,
		} ) );
	};

	const setFormField = (
		field: keyof AgencyDetailsSignupPayload,
		value?: string | string[] | null
	) => {
		setFormData( ( prev ) => ( {
			...prev,
			[ field ]: value,
		} ) );
		updateValidationError( { [ field ]: undefined } );
	};

	const handleInputChange =
		( field: keyof AgencyDetailsSignupPayload ) => ( event: ChangeEvent< HTMLInputElement > ) => {
			setFormField( field, event.target.value );
		};

	const handleSelectChange =
		( field: keyof AgencyDetailsSignupPayload ) => ( event: ChangeEvent< HTMLSelectElement > ) => {
			setFormField( field, event.target.value );
		};

	const handleSearchDropdownChange =
		( field: keyof AgencyDetailsSignupPayload ) => ( value?: string | null ) => {
			setFormField( field, value );
		};

	const handleSetServicesOffered = ( services: { value: string[] } ) => {
		setFormField( 'servicesOffered', services.value );
	};

	const handleSetProductsOffered = ( products: { value: string[] } ) => {
		setFormField( 'productsOffered', products.value );
	};

	const handleSubmit = useCallback(
		async ( e: React.FormEvent ) => {
			e.preventDefault();
			const error = await validate( formData );
			if ( error ) {
				return;
			}

			onSubmit( formData );
		},
		[ formData, validate, onSubmit ]
	);

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

	const isUserSiteOwner = formData.userType === 'site_owner';

	const stateOptions = formData.country ? stateOptionsMap[ formData.country ] : [];

	return (
		<Form
			className="signup-v2-form"
			title={ preventWidows(
				translate( "Sign up and unlock the blueprint to grow your agency's business" )
			) }
			description={ preventWidows(
				translate(
					'Join 6000+ agencies and grow your business with {{span}}Automattic for Agencies.{{/span}} Get access to site management, earn commission on referrals, and explore our tier program to launch your business potential.',
					{
						components: {
							span: <span className="signup-v2-form__a4a-span" />,
						},
					}
				)
			) }
		>
			<div className="field-mandatory-message">
				{ translate( 'Fields marked with * are required' ) }
			</div>
			<div className="signup-v2-form__name-fields">
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

			<FormField label={ translate( 'How would you describe yourself?' ) } isRequired>
				<FormSelect
					id="user_type"
					value={ formData.userType }
					onChange={ handleSelectChange( 'userType' ) }
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

			{ ! isUserSiteOwner ? (
				<>
					<FormField label={ translate( 'How many sites do you manage?' ) } isRequired>
						<FormSelect
							id="managed_sites"
							value={ formData.managedSites }
							onChange={ handleSelectChange( 'managedSites' ) }
						>
							<option value="1-5">{ translate( '1-5' ) }</option>
							<option value="6-20">{ translate( '6-20' ) }</option>
							<option value="21-50">{ translate( '21-50' ) }</option>
							<option value="51-100">{ translate( '51-100' ) }</option>
							<option value="101-500">{ translate( '101-500' ) }</option>
							<option value="500+">{ translate( '500+' ) }</option>
						</FormSelect>
					</FormField>

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

					<FormField
						error={ validationError.productsOffered }
						label={ translate( 'What Automattic products do you currently offer your clients?' ) }
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

					<div className="signup-v2-form__address-fields">
						<FormField
							error={ validationError.country }
							label={ translate( 'Where is your agency located?' ) }
							isRequired
						>
							<SearchableDropdown
								value={ formData.country }
								onChange={ handleSearchDropdownChange( 'country' ) }
								options={ countryOptions }
								placeholder={ translate( 'Select country' ) }
							/>
						</FormField>

						{ formData.country && stateOptions?.length && (
							<FormField error={ validationError.state }>
								<SearchableDropdown
									value={ formData.state }
									onChange={ handleSearchDropdownChange( 'state' ) }
									options={ stateOptions }
									placeholder={ translate( 'Select state' ) }
								/>
							</FormField>
						) }

						<FormField error={ validationError.line1 }>
							<FormTextInput
								name="line1"
								value={ formData.line1 }
								onChange={ handleInputChange( 'line1' ) }
								placeholder={ translate( 'Street name and house number' ) }
							/>
						</FormField>

						<FormField error={ validationError.line2 }>
							<FormTextInput
								name="line2"
								value={ formData.line2 }
								onChange={ handleInputChange( 'line2' ) }
								placeholder={ translate( 'Apartment, floor, suite or unit number' ) }
							/>
						</FormField>

						<FormField error={ validationError.city }>
							<FormTextInput
								name="city"
								value={ formData.city }
								onChange={ handleInputChange( 'city' ) }
								placeholder={ translate( 'City' ) }
							/>
						</FormField>

						<FormField error={ validationError.postalCode }>
							<FormTextInput
								name="postalCode"
								value={ formData.postalCode }
								onChange={ handleInputChange( 'postalCode' ) }
								placeholder={ translate( 'Postal code' ) }
							/>
						</FormField>
					</div>

					{ noCountryList && <QuerySmsCountries /> }

					<FormPhoneInput
						isDisabled={ noCountryList }
						countriesList={ countriesList }
						onChange={ handlePhoneInputChange }
						className="signup-v2-form__phone-input"
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

					<div className="signup-v2-form__tos">
						<p>
							{ translate(
								"By clicking 'Continue', you agree to the{{break}}{{/break}}{{link}}Terms of the Automattic for Agencies Platform Agreement ↗{{/link}}",
								{
									components: {
										break: <br />,
										link: (
											<button
												type="button"
												className="signup-v2-form__tos-link"
												onClick={ () => setShowTosModal( true ) }
												aria-label={ translate(
													'Terms of the Automattic for Agencies Platform Agreement'
												) }
											/>
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
							{ translate( 'Sign up for free' ) }
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
										pressable: <a href="https://pressable.com" target="_blank" rel="noreferrer" />,
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
	);
};

export default SimpleForm;
