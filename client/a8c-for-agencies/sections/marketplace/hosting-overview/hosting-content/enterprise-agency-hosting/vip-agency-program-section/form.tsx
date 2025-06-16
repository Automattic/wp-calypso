import { SearchableDropdown, FormLabel } from '@automattic/components';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import Form from 'calypso/a8c-for-agencies/components/form';
import FormField from 'calypso/a8c-for-agencies/components/form/field';
import { useCountriesAndStates } from 'calypso/a8c-for-agencies/sections/signup/agency-details-form/hooks/use-countries-and-states';
import FormInputCheckbox from 'calypso/components/forms/form-checkbox';
import FormSelect from 'calypso/components/forms/form-select';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormTextarea from 'calypso/components/forms/form-textarea';
import MultiCheckbox from 'calypso/components/forms/multi-checkbox';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

export default function VipAgencyProgramForm() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { countryOptions } = useCountriesAndStates();

	const servicesProvidedOptions = [
		{
			label: translate( 'Enterprise WordPress development' ),
			value: 'Enterprise WordPress development',
		},
		{
			label: translate( 'Content strategy and creation' ),
			value: 'Content strategy and creation',
		},
		{
			label: translate( 'Design and user experience' ),
			value: 'Design and user experience',
		},
		{
			label: translate( 'Performance optimization' ),
			value: 'Performance optimization',
		},
		{
			label: translate( 'Maintenance and support' ),
			value: 'Maintenance and support',
		},
	];

	const onPrivacyPolicyLinkClick = () => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_marketplace_hosting_enterprise_privacy_policy_link_click' )
		);
	};

	const onSubmit = () => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_marketplace_hosting_enterprise_vip_form_submit_click' )
		);
	};

	return (
		<Form className="vip-agency-program-form" title={ translate( 'Contact us' ) }>
			<h3 className="vip-agency-program-form__heading">
				{ translate( 'Tell us more about yourself.' ) }
			</h3>
			<FormField label={ translate( 'Business email' ) } labelFor="businessEmail" isRequired>
				<FormTextInput id="businessEmail" name="businessEmail" />
			</FormField>
			<FormField label={ translate( 'First name' ) } labelFor="firstName" isRequired>
				<FormTextInput id="firstName" name="firstName" />
			</FormField>
			<FormField label={ translate( 'Last name' ) } labelFor="lastName" isRequired>
				<FormTextInput id="lastName" name="lastName" />
			</FormField>
			<FormField label={ translate( 'Job title' ) } labelFor="jobTitle" isRequired>
				<FormTextInput id="jobTitle" name="jobTitle" />
			</FormField>
			<FormField label={ translate( 'Phone number' ) } labelFor="phoneNumber" isRequired>
				<FormTextInput id="phoneNumber" name="phoneNumber" />
			</FormField>
			<FormField label={ translate( 'Country' ) } labelFor="country" isRequired>
				<SearchableDropdown
					options={ countryOptions }
					placeholder={ translate( 'Select country' ) }
				/>
			</FormField>
			<h3 className="vip-agency-program-form__heading">
				{ translate( 'Tell us more about your agency.' ) }
			</h3>

			<FormField label={ translate( 'Agency website' ) } labelFor="agencyWebsite">
				<FormTextInput id="agencyWebsite" name="agencyWebsite" />
			</FormField>

			<FormField label={ translate( 'Agency size' ) } labelFor="agencySize">
				<FormSelect id="agencySize">
					<option value="11-20">{ translate( '11-20' ) }</option>
					<option value="21-50">{ translate( '21-50' ) }</option>
					<option value="51-100">{ translate( '51-100' ) }</option>
					<option value="101-250">{ translate( '101-250' ) }</option>
				</FormSelect>
			</FormField>

			<FormField label={ translate( 'Agency revenue' ) } labelFor="agencyRevenue">
				<FormSelect id="agencyRevenue">
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
				isRequired
			>
				<FormTextarea id="clientSites" name="clientSites" />
			</FormField>

			<FormField
				label={ translate( 'What services does your agency provide? check all that apply.' ) }
				labelFor="servicesProvided"
				isRequired
			>
				<MultiCheckbox
					id="servicesProvided"
					name="servicesProvided"
					options={ servicesProvidedOptions }
				/>
			</FormField>

			<FormLabel>
				<FormInputCheckbox name="privacyPolicyAgreement" />
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
			>
				{ translate( 'Submit request' ) }
			</Button>
		</Form>
	);
}
