import page from '@automattic/calypso-router';
import { Button, SearchableDropdown } from '@automattic/components';
import { TextareaControl, TextControl, ToggleControl } from '@wordpress/components';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import useShowFeedback from 'calypso/a8c-for-agencies/components/a4a-feedback/hooks/use-show-a4a-feedback';
import { FeedbackType } from 'calypso/a8c-for-agencies/components/a4a-feedback/types';
import Form from 'calypso/a8c-for-agencies/components/form';
import FormField from 'calypso/a8c-for-agencies/components/form/field';
import validateEmail from 'calypso/a8c-for-agencies/components/form/hoc/with-error-handling/validators/email';
import validateNonEmpty from 'calypso/a8c-for-agencies/components/form/hoc/with-error-handling/validators/non-empty';
import validateUrl from 'calypso/a8c-for-agencies/components/form/hoc/with-error-handling/validators/url';
import FormSection from 'calypso/a8c-for-agencies/components/form/section';
import {
	A4A_PARTNER_DIRECTORY_DASHBOARD_LINK,
	A4A_FEEDBACK_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import BudgetSelector from 'calypso/a8c-for-agencies/sections/partner-directory/components/budget-selector';
import { AgencyDetails } from 'calypso/a8c-for-agencies/sections/partner-directory/types';
import { useDispatch, useSelector } from 'calypso/state';
import { setActiveAgency } from 'calypso/state/a8c-for-agencies/agency/actions';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { Agency } from 'calypso/state/a8c-for-agencies/types';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import IndustriesSelector from '../components/industries-selector';
import LanguageSelector from '../components/languages-selector';
import ProductsSelector from '../components/products-selector';
import ServicesSelector from '../components/services-selector';
import { PARTNER_DIRECTORY_AGENCY_EXPERTISE_SLUG } from '../constants';
import { useCountryList } from './hooks/use-country-list';
import useDetailsForm from './hooks/use-details-form';
import useDetailsFormValidation from './hooks/use-details-form-validation';
import useSubmitForm from './hooks/use-submit-form';
import LogoPicker from './logo-picker';

import './style.scss';

type Props = {
	initialFormData: AgencyDetails | null;
};

const AgencyDetailsForm = ( { initialFormData }: Props ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { validate, validationError, updateValidationError } = useDetailsFormValidation();

	const agency = useSelector( getActiveAgency );

	const { isFeedbackShown } = useShowFeedback( FeedbackType.PDDetailsAdded );

	const onSubmitSuccess = useCallback(
		( response: Agency ) => {
			if ( response ) {
				dispatch( setActiveAgency( { ...agency, ...response } ) );
			}

			dispatch(
				successNotice( translate( 'Your agency profile was submitted!' ), {
					displayOnNextPage: true,
					duration: 6000,
				} )
			);

			if ( isFeedbackShown ) {
				page( A4A_PARTNER_DIRECTORY_DASHBOARD_LINK );
			} else {
				page( addQueryArgs( A4A_FEEDBACK_LINK, { type: FeedbackType.PDDetailsAdded } ) );
			}
		},
		[ agency, isFeedbackShown, translate, dispatch ]
	);

	const onSubmitError = useCallback( () => {
		dispatch(
			errorNotice( translate( 'Something went wrong submitting the profile!' ), { duration: 6000 } )
		);
	}, [ translate, dispatch ] );

	const { formData, setFormData } = useDetailsForm( {
		initialFormData,
	} );
	const { countryOptions } = useCountryList();

	const { onSubmit, isSubmitting } = useSubmitForm( { formData, onSubmitSuccess, onSubmitError } );

	const submitForm = () => {
		const error = validate( formData );
		if ( error ) {
			//FIXME: check if there's a better way to distinct parent for scrolling to the top
			const parent = document.getElementsByClassName( 'partner-directory__body' )?.[ 0 ];
			// Scrolling only for fields positioned on top
			if (
				error.name ||
				error.email ||
				error.website ||
				error.bio ||
				error.logo ||
				error.landingPage
			) {
				if ( parent ) {
					parent?.scrollTo( { behavior: 'smooth', top: 0 } );
				}
			}
			return;
		}

		onSubmit();
	};

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
				<FormField
					label={ translate( 'Company name' ) }
					description={ translate(
						'Include only your company name; save any descriptors for the Company bio section.'
					) }
					error={ validationError.name }
					field={ formData.name }
					checks={ [ validateNonEmpty() ] }
					isRequired
				>
					<TextControl
						value={ formData.name }
						onChange={ ( value ) => {
							setFormFields( { name: value } );
							updateValidationError( { name: undefined } );
						} }
					/>
				</FormField>
				<FormField
					label={ translate( 'Company email' ) }
					description={ translate( 'Client inquiries and leads will go to this email.' ) }
					error={ validationError.email }
					field={ formData.email }
					checks={ [ validateNonEmpty(), validateEmail() ] }
					isRequired
				>
					<TextControl
						value={ formData.email }
						onChange={ ( value ) => {
							setFormFields( { email: value } );
							updateValidationError( { email: undefined } );
						} }
					/>
				</FormField>
				<FormField
					label={ translate( 'Company website' ) }
					error={ validationError.website }
					field={ formData.website }
					checks={ [ validateNonEmpty(), validateUrl() ] }
					isRequired
				>
					<TextControl
						value={ formData.website }
						onChange={ ( value ) => {
							setFormFields( { website: value } );
							updateValidationError( { website: undefined } );
						} }
					/>
				</FormField>
				<FormField
					label={ translate( "Clients' landing page" ) }
					description={ translate(
						"Optional: Include your custom landing page for leads from Automattic platforms. We'll direct clients to this page."
					) }
					error={ validationError.landingPage }
					field={ formData.landingPageUrl }
					checks={ [ validateUrl() ] }
				>
					<TextControl
						value={ formData.landingPageUrl }
						onChange={ ( value ) => {
							setFormFields( { landingPageUrl: value } );
							updateValidationError( { landingPage: undefined } );
						} }
					/>
				</FormField>
				<FormField
					label={ translate( 'Company bio' ) }
					description={ translate(
						'Basic Markdown syntax is supported. {{a}}Learn more about Markdown.{{/a}}',
						{
							components: {
								a: (
									<a
										href="https://commonmark.org/help/"
										target="_blank"
										rel="noreferrer noopener"
									/>
								),
							},
						}
					) }
					error={ validationError.bio }
					checks={ [ validateNonEmpty() ] }
					field={ formData.bioDescription }
					isRequired
				>
					<TextareaControl
						value={ formData.bioDescription }
						onChange={ ( value ) => {
							setFormFields( { bioDescription: value } );
							updateValidationError( { bio: undefined } );
						} }
					/>
				</FormField>
				<FormField
					label={ translate( 'Company location' ) }
					error={ validationError.country }
					checks={ [ validateNonEmpty() ] }
					field={ formData.country }
					isRequired
				>
					<SearchableDropdown
						value={ formData.country }
						onChange={ ( value ) => {
							setFormFields( { country: value } );
							updateValidationError( { country: undefined } );
						} }
						options={ countryOptions }
						disabled={ false }
					/>
				</FormField>
				<FormField
					label={ translate( 'Company logo' ) }
					description={ translate( 'Need help? {{a}}View our logo guidelines.{{/a}}', {
						components: {
							a: (
								<a
									href="https://agencieshelp.automattic.com/knowledge-base/adding-a-logo-to-the-partner-directory-agency-profile/"
									target="_blank"
									rel="noreferrer noopener"
								/>
							),
						},
					} ) }
					sub={ translate(
						'Upload your agency logo sized at 800px by 320px. Format allowed: JPG, PNG'
					) }
					isRequired
				>
					<LogoPicker
						logo={ formData.logoUrl }
						onPick={ ( value ) => {
							setFormFields( { logoUrl: value } );
						} }
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
						label={ translate( 'Accepting new clients' ) }
					/>
				</FormField>
				<FormField label={ translate( 'Global remote work' ) }>
					<ToggleControl
						onChange={ ( isChecked ) => setFormFields( { isGlobal: isChecked } ) }
						checked={ formData.isGlobal }
						label={ translate( 'Accepting remote work from any location' ) }
					/>
				</FormField>
				<FormField
					label={ translate( 'Industries' ) }
					error={ validationError.industries }
					field={ formData.industries }
					checks={ [ validateNonEmpty() ] }
					isRequired
				>
					<IndustriesSelector
						industries={ formData.industries }
						setIndustries={ ( industries ) => {
							setFormFields( { industries } );
							updateValidationError( { industries: undefined } );
						} }
					/>
				</FormField>
				<FormField
					label={ translate( 'Services you offer' ) }
					error={ validationError.services }
					field={ formData.services }
					checks={ [ validateNonEmpty() ] }
					isRequired
				>
					<ServicesSelector
						selectedServices={ formData.services }
						setServices={ ( services ) => {
							setFormFields( { services } );
							updateValidationError( { services: undefined } );
						} }
					/>
				</FormField>
				<FormField
					label={ translate( 'Products you work with' ) }
					error={ validationError.products }
					checks={ [ validateNonEmpty() ] }
					field={ formData.products }
					isRequired
				>
					<ProductsSelector
						selectedProducts={ formData.products }
						setProducts={ ( products ) => {
							setFormFields( { products } );
							updateValidationError( { products: undefined } );
						} }
					/>
				</FormField>
				<FormField
					label={ translate( 'Languages spoken' ) }
					error={ validationError.languages }
					checks={ [ validateNonEmpty() ] }
					field={ formData.languagesSpoken }
					isRequired
				>
					<LanguageSelector
						selectedLanguages={ formData.languagesSpoken }
						setLanguages={ ( languagesSpoken ) => {
							setFormFields( { languagesSpoken } );
							updateValidationError( { languages: undefined } );
						} }
					/>
				</FormField>
			</FormSection>

			<FormSection
				title={ translate( 'Budget details' ) }
				description={ translate(
					'Optionally set your minimum budget. Clients can filter these details to find the right agency.'
				) }
			>
				<FormField
					label={ translate( 'Minimum project budget' ) }
					error={ validationError.minimumBudget }
					checks={ [ validateNonEmpty() ] }
					field={ formData.budgetLowerRange }
					isRequired
				>
					<BudgetSelector
						budgetLowerRange={ formData.budgetLowerRange }
						setBudget={ ( budget: string ) => {
							setFormFields( { budgetLowerRange: budget } );
							updateValidationError( { minimumBudget: undefined } );
						} }
					/>
				</FormField>
			</FormSection>

			<div className="partner-directory-agency-cta__required-information">
				{ translate( '* indicates required information' ) }
			</div>

			<div className="partner-directory-agency-cta__footer">
				<Button primary onClick={ submitForm } disabled={ isSubmitting }>
					{ translate( 'Save public profile' ) }
				</Button>
			</div>
		</Form>
	);
};

export default AgencyDetailsForm;
