import { FormInputValidation, FormLabel } from '@automattic/components';
import { Button, Modal } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef, useState } from 'react';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import {
	RED_ES_AGREEMENT_FIELDS,
	getRedEsAgreementTemplate,
	interpolateRedEsAgreement,
} from './red-es-agreement-text';
import type { RedEsAgreementLanguage, RedEsAgreementValues } from './red-es-agreement-text';
import type { DomainContactDetails } from '@automattic/shopping-cart';
import type { DomainContactDetailsErrors } from '@automattic/wpcom-checkout';
import type { ChangeEvent } from 'react';

const INDIVIDUAL_ENTITY_TYPE = '1';

interface RedEsAgreementProps {
	contactDetails: Record< string, unknown >;
	ccTldDetails: Record< string, unknown >;
	domainNames: string[];
	onContactDetailsChange?: ( payload: DomainContactDetails ) => void;
	contactDetailsValidationErrors: DomainContactDetailsErrors;
}

function asTrimmedString( value: unknown ): string {
	return typeof value === 'string' ? value.trim() : '';
}

function getAgreementValues(
	contactDetails: Record< string, unknown >,
	ccTldDetails: Record< string, unknown >,
	domainNames: string[]
): RedEsAgreementValues {
	const isIndividual = ccTldDetails.registrantEntityType === INDIVIDUAL_ENTITY_TYPE;
	const registrantIdentificationNumber = asTrimmedString(
		ccTldDetails.registrantIdentificationNumber
	);
	const firstName = asTrimmedString( contactDetails.firstName );
	const lastName = asTrimmedString( contactDetails.lastName );

	return {
		applicant_name: firstName && lastName ? `${ firstName } ${ lastName }` : '',
		// The applicant is always a person. An individual is their own administrative contact;
		// for an organization the form asks for the contact person's NIF/NIE separately.
		applicant_identification_number: isIndividual
			? registrantIdentificationNumber
			: asTrimmedString( ccTldDetails.adminIdentificationNumber ),
		domains: domainNames,
	};
}

function canAcceptAgreement( entityType: unknown, values: RedEsAgreementValues ): boolean {
	if ( ! entityType ) {
		return false;
	}
	return RED_ES_AGREEMENT_FIELDS.every( ( field ) => values[ field ].length > 0 );
}

function areAgreementValuesEqual( a: RedEsAgreementValues, b: RedEsAgreementValues ): boolean {
	return RED_ES_AGREEMENT_FIELDS.every( ( field ) =>
		field === 'domains'
			? a.domains.join( '\n' ) === b.domains.join( '\n' )
			: a[ field ] === b[ field ]
	);
}

export default function RedEsAgreement( {
	contactDetails,
	ccTldDetails,
	domainNames,
	onContactDetailsChange,
	contactDetailsValidationErrors,
}: RedEsAgreementProps ) {
	const translate = useTranslate();
	const [ isModalOpen, setIsModalOpen ] = useState( false );
	const [ language, setLanguage ] = useState< RedEsAgreementLanguage >( 'es' );
	// The values of the document the customer accepted, captured when the box was ticked in this
	// session. An acceptance without it (e.g. restored from cached contact details) is of some
	// other document and is reset.
	const acceptedValues = useRef< RedEsAgreementValues | null >( null );

	const values = getAgreementValues( contactDetails, ccTldDetails, domainNames );
	const canAccept = canAcceptAgreement( ccTldDetails.registrantEntityType, values );
	const isAccepted = Boolean( ccTldDetails.redEsAgreementAccepted );
	const template = getRedEsAgreementTemplate( language );

	const isAcceptanceStale =
		isAccepted &&
		( ! acceptedValues.current || ! areAgreementValuesEqual( acceptedValues.current, values ) );

	useEffect( () => {
		if ( ! isAcceptanceStale ) {
			return;
		}
		acceptedValues.current = null;
		onContactDetailsChange?.( {
			extra: { es: { redEsAgreementAccepted: false, redEsAgreementVersion: '' } },
		} );
	}, [ isAcceptanceStale, onContactDetailsChange ] );

	const handleChange = ( event: ChangeEvent< HTMLInputElement > ) => {
		const isChecked = event.target.checked;
		acceptedValues.current = isChecked ? values : null;
		onContactDetailsChange?.( {
			extra: {
				es: {
					redEsAgreementAccepted: isChecked,
					redEsAgreementVersion: isChecked ? template.version : '',
				},
			},
		} );
	};

	const esErrors = contactDetailsValidationErrors?.extra?.es;
	const acceptedError = esErrors?.redEsAgreementAccepted ?? translate( 'Required' );
	const versionError = esErrors?.redEsAgreementVersion;

	const renderModal = () => {
		const date = new Intl.DateTimeFormat( language === 'es' ? 'es-ES' : 'en-GB', {
			dateStyle: 'long',
		} ).format( new Date() );

		return (
			<Modal
				title={ template.title }
				onRequestClose={ () => setIsModalOpen( false ) }
				className="registrant-extra-info__red-es-agreement-modal"
				size="large"
				headerActions={
					<Button
						variant="tertiary"
						size="compact"
						onClick={ () => setLanguage( language === 'es' ? 'en' : 'es' ) }
					>
						{ language === 'es'
							? translate( 'English version – for information only' )
							: translate( 'Spanish version' ) }
					</Button>
				}
			>
				<div
					lang={ language }
					className="registrant-extra-info__red-es-agreement-document"
					// The template is a static legal text and every interpolated value is escaped.
					// eslint-disable-next-line react/no-danger
					dangerouslySetInnerHTML={ {
						__html: interpolateRedEsAgreement( template.body_html, values, date ),
					} }
				/>
			</Modal>
		);
	};

	return (
		<FormFieldset className="registrant-extra-info__red-es-agreement">
			<FormLabel>
				<FormCheckbox
					id="red-es-agreement-accepted"
					checked={ isAccepted }
					disabled={ ! canAccept }
					onChange={ handleChange }
				/>
				<span>{ translate( 'I have read and agree to the Red.es agreement.' ) }</span>
			</FormLabel>
			<Button
				variant="link"
				className="registrant-extra-info__red-es-agreement-link"
				disabled={ ! canAccept }
				accessibleWhenDisabled
				onClick={ () => {
					setLanguage( 'es' );
					setIsModalOpen( true );
				} }
			>
				{ translate( 'Read the agreement' ) }
			</Button>
			{ ! canAccept && (
				<FormSettingExplanation>
					{ translate( 'Fill in the details above to read and accept the Red.es agreement.' ) }
				</FormSettingExplanation>
			) }
			{ isAccepted || <FormInputValidation text={ acceptedError } isError /> }
			{ versionError && <FormInputValidation text={ versionError } isError /> }
			{ isModalOpen && canAccept && renderModal() }
		</FormFieldset>
	);
}
