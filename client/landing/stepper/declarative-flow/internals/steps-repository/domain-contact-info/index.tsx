import { camelToSnakeCase, mapRecordKeysRecursively, snakeToCamelCase } from '@automattic/js-utils';
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
import type { StepProps, ProvidedDependencies } from '../../types';

import './styles.scss';

export default function DomainContactInfo( { navigation }: StepProps ) {
	const { submit } = navigation;
	const { __ } = useI18n();

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
			stepContent={ <ContactInfo onSubmit={ submit } /> }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
}

function ContactInfo( {
	onSubmit,
}: {
	onSubmit:
		| ( ( providedDependencies?: ProvidedDependencies | undefined, ...params: string[] ) => void )
		| undefined;
} ) {
	const translate = useTranslate();
	const { domain } = useDomainParams();

	function getIsFieldDisabled() {
		return false;
	}

	function validate(
		fieldValues: Record< string, string | number >,
		onComplete: ( nullOrError: null | Error, data?: Record< string, unknown > | undefined ) => void
	) {
		wp.req
			.post(
				'/me/domain-contact-information/validate',
				mapRecordKeysRecursively(
					{
						contactInformation: fieldValues,
						domainNames: [ domain ],
					},
					camelToSnakeCase
				)
			)
			.then( ( data: { messages: Record< string, unknown > } ) => {
				onComplete( null, mapRecordKeysRecursively( data?.messages || {}, snakeToCamelCase ) );
			} )
			.catch( ( error: Error ) => {
				onComplete( error );
			} );
	}

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
