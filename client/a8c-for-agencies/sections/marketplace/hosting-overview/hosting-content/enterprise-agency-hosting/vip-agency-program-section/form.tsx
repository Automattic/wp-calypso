import { SearchableDropdown, FormLabel } from '@automattic/components';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { ChangeEvent, useCallback } from 'react';
import Form from 'calypso/a8c-for-agencies/components/form';
import FormField from 'calypso/a8c-for-agencies/components/form/field';
import FormInputCheckbox from 'calypso/components/forms/form-checkbox';
import FormSelect from 'calypso/components/forms/form-select';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormTextarea from 'calypso/components/forms/form-textarea';
import MultiCheckbox from 'calypso/components/forms/multi-checkbox';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import useAgencyProgramForm from './hooks/use-agency-program-form';

export default function VipAgencyProgramForm() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const {
		countryOptions,
		servicesProvidedOptions,
		formData,
		updateFormData,
		validationError,
		validate,
		updateValidationError,
		applyAgencyProgram,
		isPendingApplication,
		resetForm,
	} = useAgencyProgramForm();

	const onPrivacyPolicyLinkClick = () => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_marketplace_hosting_enterprise_privacy_policy_link_click' )
		);
	};

	const handleInputChange = ( name: string, value: string | string[] | boolean ) => {
		updateFormData( name, value );
		updateValidationError( { [ name ]: '' } );
	};

	const handleSetServicesProvided = ( servicesProvided: { value: string[] } ) => {
		handleInputChange( 'servicesProvided', servicesProvided.value );
	};

	const onSubmit = useCallback(
		async ( e: React.FormEvent ) => {
			e.preventDefault();

			dispatch(
				recordTracksEvent( 'calypso_a4a_marketplace_hosting_enterprise_vip_form_submit_click' )
			);

			const error = await validate( formData );
			if ( error ) {
				return;
			}

			applyAgencyProgram( formData, {
				onSuccess: () => {
					dispatch( successNotice( translate( 'Your request has been submitted successfully.' ) ) );
					resetForm();
				},
				onError: () => {
					dispatch(
						errorNotice( translate( 'An error occurred while submitting your request.' ) )
					);
				},
			} );
		},
		[ dispatch, validate, formData, applyAgencyProgram, translate, resetForm ]
	);

	return (
		<Form className="vip-agency-program-form" title={ translate( 'Contact us' ) }>
			<h3 className="vip-agency-program-form__heading">
				{ translate( 'Tell us more about yourself.' ) }
			</h3>
			<FormField
				label={ translate( 'Business email' ) }
				labelFor="businessEmail"
				error={ validationError.businessEmail }
				isRequired
			>
				<FormTextInput
					id="businessEmail"
					name="businessEmail"
					value={ formData.businessEmail }
					onChange={ ( e: ChangeEvent< HTMLInputElement > ) =>
						handleInputChange( 'businessEmail', e.target.value )
					}
				/>
			</FormField>
			<FormField
				label={ translate( 'First name' ) }
				labelFor="firstName"
				error={ validationError.firstName }
				isRequired
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
				isRequired
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
			<FormField
				label={ translate( 'Job title' ) }
				labelFor="jobTitle"
				error={ validationError.jobTitle }
				isRequired
			>
				<FormTextInput
					id="jobTitle"
					name="jobTitle"
					value={ formData.jobTitle }
					onChange={ ( e: ChangeEvent< HTMLInputElement > ) =>
						handleInputChange( 'jobTitle', e.target.value )
					}
				/>
			</FormField>
			<FormField
				label={ translate( 'Phone number' ) }
				labelFor="phoneNumber"
				error={ validationError.phoneNumber }
				isRequired
			>
				<FormTextInput
					id="phoneNumber"
					name="phoneNumber"
					value={ formData.phoneNumber }
					onChange={ ( e: ChangeEvent< HTMLInputElement > ) =>
						handleInputChange( 'phoneNumber', e.target.value )
					}
				/>
			</FormField>
			<FormField
				label={ translate( 'Country' ) }
				labelFor="country"
				error={ validationError.country }
				isRequired
			>
				<SearchableDropdown
					options={ countryOptions }
					placeholder={ translate( 'Select country' ) }
					value={ formData.country }
					onChange={ ( value?: string | null ) => handleInputChange( 'country', value ?? '' ) }
				/>
			</FormField>
			<h3 className="vip-agency-program-form__heading">
				{ translate( 'Tell us more about your agency.' ) }
			</h3>

			<FormField
				label={ translate( 'Agency website' ) }
				labelFor="agencyWebsite"
				error={ validationError.agencyWebsite }
			>
				<FormTextInput
					id="agencyWebsite"
					name="agencyWebsite"
					value={ formData.agencyWebsite }
					onChange={ ( e: ChangeEvent< HTMLInputElement > ) =>
						handleInputChange( 'agencyWebsite', e.target.value )
					}
				/>
			</FormField>

			<FormField
				label={ translate( 'Agency size' ) }
				labelFor="agencySize"
				error={ validationError.agencySize }
			>
				<FormSelect
					id="agencySize"
					name="agencySize"
					value={ formData.agencySize }
					onChange={ ( e: ChangeEvent< HTMLSelectElement > ) =>
						handleInputChange( 'agencySize', e.target.value )
					}
				>
					<option value="11-20">{ translate( '11-20' ) }</option>
					<option value="21-50">{ translate( '21-50' ) }</option>
					<option value="51-100">{ translate( '51-100' ) }</option>
					<option value="101-250">{ translate( '101-250' ) }</option>
				</FormSelect>
			</FormField>

			<FormField
				label={ translate( 'Agency revenue' ) }
				labelFor="agencyRevenue"
				error={ validationError.agencyRevenue }
			>
				<FormSelect
					id="agencyRevenue"
					name="agencyRevenue"
					value={ formData.agencyRevenue }
					onChange={ ( e: ChangeEvent< HTMLSelectElement > ) =>
						handleInputChange( 'agencyRevenue', e.target.value )
					}
				>
					<option value="$500,000 - $1 mil.">{ translate( '$500,000 - $1 mil.' ) }</option>
					<option value="$1 mil. - $5 mil.">{ translate( '$1 mil. - $5 mil.' ) }</option>
					<option value="$5 mil. - $10 mil.">{ translate( '$5 mil. - $10 mil.' ) }</option>
					<option value="$10 mil. - $25 mil.">{ translate( '$10 mil. - $25 mil.' ) }</option>
					<option value="$25 mil. - $50 mil.">{ translate( '$25 mil. - $50 mil.' ) }</option>
				</FormSelect>
			</FormField>

			<FormField
				label={ translate(
					'Please provide a few links to enterprise client sites your agency has worked on.'
				) }
				labelFor="clientSites"
				error={ validationError.clientSites }
				isRequired
			>
				<FormTextarea
					id="clientSites"
					name="clientSites"
					value={ formData.clientSites }
					onChange={ ( e: ChangeEvent< HTMLTextAreaElement > ) =>
						handleInputChange( 'clientSites', e.target.value )
					}
				/>
			</FormField>

			<FormField
				label={ translate( 'What services does your agency provide? check all that apply.' ) }
				labelFor="servicesProvided"
				error={ validationError.servicesProvided }
				isRequired
			>
				<MultiCheckbox
					id="servicesProvided"
					name="servicesProvided"
					options={ servicesProvidedOptions }
					checked={ formData.servicesProvided }
					onChange={ handleSetServicesProvided as any }
				/>
			</FormField>

			<FormLabel>
				<FormInputCheckbox
					name="subscribeToNewsletter"
					checked={ formData.subscribeToNewsletter }
					onChange={ () => {
						updateFormData( 'subscribeToNewsletter', ! formData.subscribeToNewsletter );
					} }
				/>
				<span>
					{ translate(
						'Stay in the loop! Check this box to get the latest updates, tips, and exclusive content. Unsubscribe anytime. Your information is protected per our {{privacyLink/}}.*',
						{
							components: {
								privacyLink: (
									<a
										href="https://wpvip.com/privacy/"
										onClick={ onPrivacyPolicyLinkClick }
										target="_blank"
										rel="noopener noreferrer"
									>
										{ translate( 'privacy policy' ) }
									</a>
								),
							},
						}
					) }
				</span>
			</FormLabel>

			<Button
				className="enterprise-agency-hosting__cta-button"
				variant="primary"
				onClick={ onSubmit }
				isBusy={ isPendingApplication }
			>
				{ translate( 'Submit request' ) }
			</Button>
		</Form>
	);
}
