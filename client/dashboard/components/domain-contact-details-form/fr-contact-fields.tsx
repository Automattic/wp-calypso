import { __ } from '@wordpress/i18n';
import type {
	DomainContactDetails,
	FrDomainContactExtraDetails,
	WhoisContactExtra,
} from '@automattic/api-core';
import type { Field } from '@wordpress/dataviews';

/**
 * `.fr` registrant types accepted by AFNIC, as listed in the `.fr` validation
 * schema. The labels match the ones used at checkout so a registrant sees the
 * same wording when buying and when editing.
 */
const REGISTRANT_TYPE_LABELS: Record< string, () => string > = {
	individual: () => __( 'An individual' ),
	organization: () => __( 'A company or organization' ),
};

// From the `.fr` validation schema: exactly 9 (SIREN) or 14 (SIRET) digits.
const SIREN_SIRET_PATTERN = '^([0-9]{9}|[0-9]{14})?$';

// From the `.fr` validation schema: exactly 9 digits.
const TRADEMARK_NUMBER_PATTERN = '^([0-9]{9})?$';

export const FR_FIELD_IDS = {
	registrantType: 'frRegistrantType',
	registrantVatId: 'frRegistrantVatId',
	sirenSiret: 'frSirenSiret',
	trademarkNumber: 'frTrademarkNumber',
} as const;

/**
 * Maps each `.fr` form field to the key the validation endpoint reports its
 * errors under. Most are the dotted path of the offending value; the VAT number
 * is the exception — the schema files its format errors under `vat_id` via
 * `error_field`.
 */
export const FR_FIELD_TO_API_KEY_MAP: Record< string, string > = {
	[ FR_FIELD_IDS.registrantType ]: 'extra.fr.registrant_type',
	[ FR_FIELD_IDS.registrantVatId ]: 'vat_id',
	[ FR_FIELD_IDS.sirenSiret ]: 'extra.fr.siren_siret',
	[ FR_FIELD_IDS.trademarkNumber ]: 'extra.fr.trademark_number',
};

export function isFrDomain( domainName: string ) {
	return domainName.toLowerCase().endsWith( '.fr' );
}

export function hasFrDomain( domainNames: string[] ) {
	return domainNames.some( isFrDomain );
}

export function getFrExtra( data: DomainContactDetails ): FrDomainContactExtraDetails {
	return data.extra?.fr ?? {};
}

/**
 * Converts the registrar's stored `.fr` registrant details into the shape the
 * form holds them in. The WHOIS read returns the registrar's own flat
 * snake_case keys, so nothing here is nested under `fr` yet.
 *
 * Returns undefined when the registrar has nothing stored, which leaves the
 * registrant type unselected rather than guessing one.
 */
export function mapWhoisExtraToFrContactExtra(
	extra: WhoisContactExtra | undefined
): FrDomainContactExtraDetails | undefined {
	if ( ! extra?.registrant_type ) {
		return undefined;
	}

	return {
		registrantType: extra.registrant_type,
		...( extra.registrant_vat_id ? { registrantVatId: extra.registrant_vat_id } : {} ),
		...( extra.siren_siret ? { sirenSiret: extra.siren_siret } : {} ),
		...( extra.trademark_number ? { trademarkNumber: extra.trademark_number } : {} ),
	};
}

function setFrExtra(
	item: DomainContactDetails,
	edits: FrDomainContactExtraDetails
): Partial< DomainContactDetails > {
	// Return the whole `extra` object: the form merges edits shallowly, so a
	// partial one would drop the sibling `.fr` values and any other ccTLD data.
	return { extra: { ...item.extra, fr: { ...getFrExtra( item ), ...edits } } };
}

/**
 * Sets the registrant type, dropping the organization-only values when the
 * registrant switches to `individual`.
 *
 * Hiding those fields is not enough: their values stay on the payload, and the
 * schema validates a VAT, SIREN/SIRET, or trademark number's format whenever
 * one is present, whatever the registrant type. A value left behind by an
 * earlier selection could fail validation with no control on screen to correct
 * it.
 *
 * The contact's organization name is cleared too: AFNIC decides whether a `.fr`
 * registrant is a legal entity by the contact carrying an organization, not by
 * the registrant type we store, so an individual with an organization name
 * would still be registered as a legal entity — one with no SIREN or VAT.
 */
function setFrRegistrantType(
	item: DomainContactDetails,
	registrantType: string
): Partial< DomainContactDetails > {
	const { registrantVatId, sirenSiret, trademarkNumber, ...rest } = getFrExtra( item );

	return {
		...( 'individual' === registrantType && item.organization ? { organization: '' } : {} ),
		extra: {
			...item.extra,
			fr: {
				...rest,
				registrantType,
				...( hasFrOrganizationFields( registrantType )
					? {
							...( registrantVatId ? { registrantVatId } : {} ),
							...( sirenSiret ? { sirenSiret } : {} ),
							...( trademarkNumber ? { trademarkNumber } : {} ),
					  }
					: {} ),
			},
		},
	};
}

/**
 * The error shown on the organization field when a `.fr` individual registrant
 * has one, and null otherwise.
 *
 * Guards the state setFrRegistrantType's clearing cannot reach: the registrant
 * typing an organization back in after selecting the individual type. Left
 * alone, that combination registers the contact as a legal entity at AFNIC.
 */
export function validateFrOrganization( data: DomainContactDetails ): string | null {
	if ( 'individual' === getFrExtra( data ).registrantType && data.organization ) {
		return __(
			'An individual .fr registrant cannot have an organization. Clear this field, or choose the company or organization option.'
		);
	}
	return null;
}

/**
 * Layers the `.fr` individual-registrant rule onto the shared organization
 * field, ahead of whatever validation the field already carries.
 */
export function withFrOrganizationValidation(
	fields: Field< DomainContactDetails >[]
): Field< DomainContactDetails >[] {
	return fields.map( ( field ) => {
		if ( field.id !== 'organization' ) {
			return field;
		}

		const baseCustom = field.isValid?.custom;

		return {
			...field,
			isValid: {
				...field.isValid,
				custom: async ( data, normalizedField ) =>
					validateFrOrganization( data ) ?? ( await baseCustom?.( data, normalizedField ) ) ?? null,
			},
		};
	} );
}

export function hasFrOrganizationFields( registrantType?: string ) {
	return registrantType === 'organization';
}

/**
 * Builds the `.fr` registrant fields for the contact form.
 *
 * The organization-only fields are optional but are only included when the
 * registrant type is `organization`, matching the checkout form. The VAT number
 * has no client-side pattern — the accepted formats vary per EU country, so its
 * validation is left to the endpoint, whose errors attach to the field through
 * FR_FIELD_TO_API_KEY_MAP.
 */
export const getFrContactFormFields = (
	registrantType: string | undefined
): Field< DomainContactDetails >[] => {
	const fields: Field< DomainContactDetails >[] = [
		{
			id: FR_FIELD_IDS.registrantType,
			label: __( "Who's this domain for?" ),
			Edit: 'select',
			// No default: the registrar's stored type is prefilled when known, and
			// otherwise the registrant picks one. Defaulting would silently rewrite
			// an organization registrant's type on an unrelated edit.
			elements: [
				{ label: __( 'Select an option' ), value: '' },
				...Object.entries( REGISTRANT_TYPE_LABELS ).map( ( [ value, getLabel ] ) => ( {
					label: getLabel(),
					value,
				} ) ),
			],
			getValue: ( { item } ) => getFrExtra( item ).registrantType ?? '',
			setValue: ( { item, value } ) => setFrRegistrantType( item, value ),
			isValid: { required: true },
		},
	];

	if ( hasFrOrganizationFields( registrantType ) ) {
		fields.push(
			{
				id: FR_FIELD_IDS.registrantVatId,
				label: __( 'VAT number' ),
				type: 'text',
				placeholder: __( 'ex. FRXX123456789' ),
				getValue: ( { item } ) => getFrExtra( item ).registrantVatId ?? '',
				setValue: ( { item, value } ) =>
					setFrExtra( item, {
						registrantVatId: value.toUpperCase().replace( /[^0-9A-Z+*]/g, '' ),
					} ),
			},
			{
				id: FR_FIELD_IDS.sirenSiret,
				label: __( 'SIREN or SIRET number' ),
				type: 'text',
				placeholder: __( 'ex. 123 456 789 or 123 456 789 01234' ),
				getValue: ( { item } ) => getFrExtra( item ).sirenSiret ?? '',
				setValue: ( { item, value } ) =>
					setFrExtra( item, { sirenSiret: value.replace( /[^0-9]/g, '' ) } ),
				isValid: { pattern: SIREN_SIRET_PATTERN },
			},
			{
				id: FR_FIELD_IDS.trademarkNumber,
				label: __( 'EU trademark number' ),
				type: 'text',
				placeholder: __( 'ex. 012345678' ),
				getValue: ( { item } ) => getFrExtra( item ).trademarkNumber ?? '',
				setValue: ( { item, value } ) =>
					setFrExtra( item, { trademarkNumber: value.replace( /[^0-9]/g, '' ) } ),
				isValid: { pattern: TRADEMARK_NUMBER_PATTERN },
			}
		);
	}

	return fields;
};

/**
 * The `.fr` field IDs to lay out, in order, for the current registrant type.
 */
export const getFrContactFormLayout = ( registrantType: string | undefined ): string[] => {
	const layout: string[] = [ FR_FIELD_IDS.registrantType ];

	if ( hasFrOrganizationFields( registrantType ) ) {
		layout.push(
			FR_FIELD_IDS.registrantVatId,
			FR_FIELD_IDS.sirenSiret,
			FR_FIELD_IDS.trademarkNumber
		);
	}

	return layout;
};
