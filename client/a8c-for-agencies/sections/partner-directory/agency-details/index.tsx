import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import { TextareaControl, TextControl, ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import Form from 'calypso/a8c-for-agencies/components/form';
import FormField from 'calypso/a8c-for-agencies/components/form/field';
import FormSection from 'calypso/a8c-for-agencies/components/form/section';
import SearchableDropdown from 'calypso/a8c-for-agencies/components/searchable-dropdown';
import { A4A_PARTNER_DIRECTORY_DASHBOARD_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import BudgetSelector from 'calypso/a8c-for-agencies/sections/partner-directory/components/budget-selector';
import { AgencyDetails } from 'calypso/a8c-for-agencies/sections/partner-directory/types';
import { reduxDispatch } from 'calypso/lib/redux-bridge';
import { setActiveAgency } from 'calypso/state/a8c-for-agencies/agency/actions';
import { Agency } from 'calypso/state/a8c-for-agencies/types';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import IndustrySelector from '../components/industry-selector';
import LanguageSelector from '../components/languages-selector';
import ProductsSelector from '../components/products-selector';
import ServicesSelector from '../components/services-selector';
import { PARTNER_DIRECTORY_AGENCY_EXPERTISE_SLUG } from '../constants';
import { validateURL } from '../utils/tools';
import { useCountryList } from './hooks/use-country-list';
import useDetailsForm from './hooks/use-details-form';
import useSubmitForm from './hooks/use-submit-form';

import './style.scss';

type Props = {
	initialFormData: AgencyDetails | null;
};

const AgencyDetailsForm = ( { initialFormData }: Props ) => {
	const translate = useTranslate();

	const onSubmitSuccess = useCallback(
		( response: Agency ) => {
			response && reduxDispatch( setActiveAgency( response ) );

			reduxDispatch(
				successNotice( translate( 'Your agency profile was submitted!' ), {
					displayOnNextPage: true,
					duration: 6000,
				} )
			);
			page( A4A_PARTNER_DIRECTORY_DASHBOARD_LINK );
		},
		[ page, reduxDispatch, translate ]
	);

	const onSubmitError = useCallback( () => {
		reduxDispatch(
			errorNotice( translate( 'Something went wrong submitting the profile!' ), {
				duration: 6000,
			} )
		);
	}, [ page, reduxDispatch, translate ] );

	const { formData, setFormData } = useDetailsForm( {
		initialFormData,
	} );
	const { countryOptions } = useCountryList();

	const { onSubmit, isSubmitting } = useSubmitForm( { formData, onSubmitSuccess, onSubmitError } );

	const setFormFields = ( fields: Record< string, any > ) => {
		setFormData( ( state: AgencyDetails ) => {
			return {
				...state,
				...fields,
			};
		} );
	};

	return (
		<Form
			className="partner-directory-agency-details"
			title={ translate( 'Finish adding details to your public profile' ) }
			autocomplete="off"
			description={
				<>
					Add details to your agency's public profile for clients to see.{ ' ' }
					<a href={ `/partner-directory/${ PARTNER_DIRECTORY_AGENCY_EXPERTISE_SLUG }` }>
						Want to update your expertise instead?
					</a>
				</>
			}
		>
			<FormSection title={ translate( 'Agency information' ) }>
				<FormField label={ translate( 'Company name' ) } isRequired>
					<TextControl
						value={ formData.name }
						onChange={ ( value ) => setFormFields( { name: value } ) }
					/>
				</FormField>
				<FormField
					label={ translate( 'Company email' ) }
					description={ translate( 'Client inquiries and leads will go to this email.' ) }
					isRequired
				>
					<TextControl
						value={ formData.email }
						onChange={ ( value ) => setFormFields( { email: value } ) }
					/>
				</FormField>
				<FormField
					label={ translate( 'Company website' ) }
					validationText={
						formData.logoUrl.length < 3 || validateURL( formData.website )
							? ''
							: translate( 'Invalid URL' )
					}
					isRequired
				>
					<TextControl
						value={ formData.website }
						onChange={ ( value ) => setFormFields( { website: value } ) }
					/>
				</FormField>
				<FormField
					label={ translate( "Clients' landing page" ) }
					description={ translate(
						"Optional: Include your custom landing page for leads from Automattic platforms. We'll direct clients to this page."
					) }
					validationText={
						formData.landingPageUrl.length < 3 || validateURL( formData.landingPageUrl )
							? ''
							: translate( 'Invalid URL' )
					}
				>
					<TextControl
						value={ formData.landingPageUrl }
						onChange={ ( value ) => setFormFields( { landingPageUrl: value } ) }
					/>
				</FormField>
				<FormField label={ translate( 'Company bio' ) } isRequired>
					<TextareaControl
						value={ formData.bioDescription }
						onChange={ ( value ) => setFormFields( { bioDescription: value } ) }
					/>
				</FormField>
				<FormField label={ translate( 'Company location' ) } isRequired>
					<SearchableDropdown
						value={ formData.country }
						onChange={ ( value ) => {
							setFormFields( { country: value } );
						} }
						options={ countryOptions }
						disabled={ false }
					/>
				</FormField>
				<FormField
					label={ translate( 'Company logo' ) }
					description={ translate(
						'Upload your agency logo sized at 800px by 320px. Format allowed: JPG, PNG'
					) }
					validationText={
						formData.logoUrl.length < 3 || validateURL( formData.logoUrl )
							? ''
							: translate( 'Invalid URL' )
					}
					isRequired
				>
					<TextControl
						value={ formData.logoUrl }
						onChange={ ( value ) => setFormFields( { logoUrl: value } ) }
					/>
				</FormField>
			</FormSection>

			<FormSection
				title={ translate( 'Listing details' ) }
				description={ translate( 'Clients can filter these details to find the right agency.' ) }
			>
				<FormField label={ translate( 'Availability' ) }>
					<ToggleControl
						onChange={ ( isChecked ) => setFormFields( { isAvailable: isChecked } ) }
						checked={ formData.isAvailable }
						label={
							formData.isAvailable
								? translate( "I'm accepting new clients" )
								: translate( "I'm not accepting new clients" )
						}
					/>
				</FormField>
				<FormField label={ translate( 'Industry' ) } isRequired>
					<IndustrySelector
						industry={ formData.industry }
						setIndustry={ ( industry ) => setFormFields( { industry: industry } ) }
					/>
				</FormField>
				<FormField label={ translate( 'Services you offer' ) } isRequired>
					<ServicesSelector
						selectedServices={ formData.services }
						setServices={ ( services ) => setFormFields( { services } ) }
					/>
				</FormField>
				<FormField label={ translate( 'Products you work with' ) } isRequired>
					<ProductsSelector
						selectedProducts={ formData.products }
						setProducts={ ( products ) => setFormFields( { products } ) }
					/>
				</FormField>
				<FormField label={ translate( 'Languages spoken' ) } isRequired>
					<LanguageSelector
						selectedLanguages={ formData.languagesSpoken }
						setLanguages={ ( languagesSpoken ) => setFormFields( { languagesSpoken } ) }
					/>
				</FormField>
			</FormSection>

			<FormSection
				title={ translate( 'Budget details' ) }
				description={ translate(
					'Optionally set your minimum budget. Clients can filter these details to find the right agency.'
				) }
			>
				<FormField label={ translate( 'Minimum project budget' ) } isRequired>
					<BudgetSelector
						budgetLowerRange={ formData.budgetLowerRange }
						setBudget={ ( budget: string ) => setFormFields( { budgetLowerRange: budget } ) }
					/>
				</FormField>
			</FormSection>

			<div className="partner-directory-agency-cta__required-information">
				{ translate( '* indicates required information' ) }
			</div>

			<div className="partner-directory-agency-cta__footer">
				<Button primary onClick={ onSubmit } disabled={ isSubmitting }>
					{ translate( 'Save public profile' ) }
				</Button>
			</div>
		</Form>
	);
};

export default AgencyDetailsForm;
