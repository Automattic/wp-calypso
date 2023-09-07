import { useI18n } from '@wordpress/react-i18n';
import { useTranslate } from 'i18n-calypso';
import { StepContainer } from 'calypso/../packages/onboarding/src';
import ContactDetailsFormFields from 'calypso/components/domains/contact-details-form-fields';
import FormattedHeader from 'calypso/components/formatted-header';
import { useDomainParams } from 'calypso/landing/stepper/hooks/use-domain-params';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import wp from 'calypso/lib/wp';
import {
	domainManagementContactsPrivacy,
	domainManagementEdit,
} from 'calypso/my-sites/domains/paths';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import type { StepProps } from '../../types';

import './styles.scss';

export default function DomainContactInfo( { navigation }: StepProps ) {
	const { submit } = navigation;
	const { __ } = useI18n();

	const handleSubmit = () => {
		submit?.();
	};

	return (
		<StepContainer
			hideBack
			stepName="domain-contact-info"
			isLargeSkipLayout={ false }
			formattedHeader={
				<FormattedHeader
					id="domain-contact-info__header"
					headerText={ __( 'Enter your contact informaiton' ) }
					subHeaderText={ __(
						'Domain owners are required to provide correct contact information.'
					) }
				/>
			}
			stepContent={ <ContactInfo onSubmit={ handleSubmit } /> }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
}

function ContactInfo( { onSubmit }: { onSubmit: () => void } ) {
	const translate = useTranslate();
	const { domain } = useDomainParams();

	function getIsFieldDisabled( fieldName: string ) {
		return false;
	}

	function validate() {}

	function handleContactDetailsChange() {}

	return (
		<form>
			<ContactDetailsFormFields
				eventFormName="Edit Contact Info"
				contactDetails={ {
					firstName: '',
					lastName: '',
					organization: '',
					email: '',
					phone: '',
					address1: '',
					address2: '',
					city: '',
					state: '',
					postalCode: '',
					countryCode: '',
					fax: '',
				} }
				needsFax={ domain?.endsWith( '.nl' ) }
				getIsFieldDisabled={ getIsFieldDisabled }
				onContactDetailsChange={ handleContactDetailsChange }
				onSubmit={ onSubmit }
				onValidate={ validate }
				labelTexts={ { submitButton: translate( 'Receive domain transfer' ) } }
				disableSubmitButton={ false }
				isSubmitting={ false }
				updateWpcomEmailCheckboxHidden={ true }
				cancelHidden={ true }
			></ContactDetailsFormFields>
		</form>
	);
}
