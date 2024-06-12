import { Button } from '@automattic/components';
import { CheckboxControl, TextareaControl, TextControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import Form from 'calypso/a8c-for-agencies/components/form';
import FormField from 'calypso/a8c-for-agencies/components/form/field';
import FormSection from 'calypso/a8c-for-agencies/components/form/section';
import BudgetSelector from 'calypso/a8c-for-agencies/sections/partner-directory/components/budget-selector';
import { AgencyDetails } from 'calypso/a8c-for-agencies/sections/partner-directory/types';
import IndustrySelector from '../components/industry-selector';
import LanguageSelector from '../components/laguages-selector';
import ProductsSelector from '../components/products-selector';
import ServicesSelector from '../components/services-selector';
import { PARTNER_DIRECTORY_AGENCY_EXPERTISE_SLUG } from '../constants';
import useDetailsForm from './hooks/use-details-form';
import useSubmitForm from './hooks/use-submit-form';

const AgencyDetailsForm = () => {
	const translate = useTranslate();

	const { formData, setFormData, isValidFormData } = useDetailsForm();

	const { onSubmit, isSubmitting } = useSubmitForm( { formData } );

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
			title={ translate( 'Finish adding details to your public profile' ) }
			description={
				<>
					Add details to your agency\'s public profile for clients to see.{ ' ' }
					<a href={ `/partner-directory/${ PARTNER_DIRECTORY_AGENCY_EXPERTISE_SLUG }` }>
						Want to update your expertise instead?
					</a>
				</>
			}
		>
			<FormSection title={ translate( 'Agency information' ) }>
				<FormField label={ translate( 'Company name' ) }>
					<TextControl
						value={ formData.name }
						onChange={ ( value ) => setFormFields( { name: value } ) }
					/>
				</FormField>
				<FormField
					label={ translate( 'Company email' ) }
					description={ translate( 'Client inquiries and leads will go to this email.' ) }
				>
					<TextControl
						value={ formData.email }
						onChange={ ( value ) => setFormFields( { email: value } ) }
					/>
				</FormField>
				<FormField label={ translate( 'Company website' ) }>
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
				>
					<TextControl
						value={ formData.landingPageUrl }
						onChange={ ( value ) => setFormFields( { landingPageUrl: value } ) }
					/>
				</FormField>
				<FormField label={ translate( 'Company bio' ) }>
					<TextareaControl
						value={ formData.bioDescription }
						onChange={ ( value ) => setFormFields( { bioDescription: value } ) }
					/>
				</FormField>
				<FormField label={ translate( 'Company location' ) }>
					<TextControl
						value={ formData.country }
						onChange={ ( value ) => setFormFields( { country: value } ) }
					/>
				</FormField>
				<FormField
					label={ translate( 'Company logo' ) }
					description={ translate( 'Upload your agency logo sized at 800px by 320px.' ) }
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
					<CheckboxControl
						checked={ formData.isAvailable }
						onChange={ ( isChecked ) => setFormFields( { isAvailable: isChecked } ) }
						label={ translate( "I'm accepting new clients" ) }
					/>
				</FormField>
				<FormField label={ translate( 'Industry' ) }>
					<IndustrySelector
						industry={ formData.industry }
						setIndustry={ ( industry ) => setFormFields( { industry: industry } ) }
					/>
				</FormField>
				<FormField label={ translate( 'Services you offer' ) }>
					<ServicesSelector
						selectedServices={ formData.services }
						setServices={ ( services ) => setFormFields( { services } ) }
					/>
				</FormField>
				<FormField label={ translate( 'Products you work with' ) }>
					<ProductsSelector
						selectedProducts={ formData.products }
						setProducts={ ( products ) => setFormFields( { products } ) }
					/>
				</FormField>
				<FormField label={ translate( 'Languages spoken' ) }>
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
				<div>{ translate( 'Minimum project budget' ) }</div>
				<BudgetSelector
					budgetLowerRange={ formData.budgetLowerRange }
					setBudget={ ( budget: string ) => setFormFields( { budgetLowerRange: budget } ) }
				/>
			</FormSection>
			<div className="agency-details-form__footer">
				<Button primary onClick={ onSubmit } disabled={ ! isValidFormData || isSubmitting }>
					{ translate( 'Publish public profile' ) }
				</Button>
			</div>
		</Form>
	);
};

export default AgencyDetailsForm;
