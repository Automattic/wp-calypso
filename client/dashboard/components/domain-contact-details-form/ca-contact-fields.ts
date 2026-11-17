import { __ } from '@wordpress/i18n';
import type {
	CaDomainContactExtraDetails,
	DomainContactDetails,
	WhoisContactExtra,
} from '@automattic/api-core';
import type { Field } from '@wordpress/dataviews';

/**
 * `.ca` legal types accepted by CIRA, as listed in the `.ca` validation schema.
 * The labels match the ones used at checkout so a registrant sees the same
 * wording when buying and when editing.
 */
const LEGAL_TYPE_LABELS: Record< string, () => string > = {
	CCT: () => __( 'Canadian Citizen' ),
	CCO: () => __( 'Canadian Corporation' ),
	RES: () => __( 'Permanent Resident' ),
	GOV: () => __( 'Government' ),
	EDU: () => __( 'Educational Institution' ),
	ASS: () =>
		/* translators: refers to Canadian legal concept -- encompasses entities like religious congregations, social clubs, community groups, etc */
		__( 'Unincorporated Association' ),
	HOP: () => __( 'Hospital' ),
	PRT: () => __( 'Partnership' ),
	TDM: () => __( 'Trademark Owner' ),
	TRD: () => __( 'Trade Union' ),
	PLT: () => __( 'Political Party' ),
	LAM: () => __( 'Library, Archive, or Museum' ),
	TRS: () =>
		/* translators: refers to the legal concept of trust (noun) */
		__( 'Trust' ),
	ABO: () =>
		/* translators: refers to indigenous peoples, specifically of Canada */
		__( 'Aboriginal Peoples' ),
	INB: () =>
		/* translators: refers to Canadian legal concept -- Indian meaning the indigenous people of North America and band meaning a small group or community */
		__( 'Indian Band' ),
	LGR: () => __( 'Legal Representative' ),
	OMK: () =>
		/* translators: refers to a Canadian legal concept -- similar to a trademark */
		__( 'Official Mark' ),
	MAJ: () => __( 'His Majesty the King' ),
};

export const CA_FIELD_IDS = {
	legalType: 'caLegalType',
} as const;

/**
 * Maps each `.ca` form field to the dotted path the validation endpoint reports
 * its errors under, so a server message can be attached to the right control.
 */
export const CA_FIELD_TO_API_KEY_MAP: Record< string, string > = {
	[ CA_FIELD_IDS.legalType ]: 'extra.ca.legal_type',
};

export function isCaDomain( domainName: string ) {
	return domainName.toLowerCase().endsWith( '.ca' );
}

export function hasCaDomain( domainNames: string[] ) {
	return domainNames.some( isCaDomain );
}

export function getCaExtra( data: DomainContactDetails ): CaDomainContactExtraDetails {
	return data.extra?.ca ?? {};
}

/**
 * Converts the registrar's stored `.ca` registrant details into the shape the
 * form holds them in. The WHOIS read returns the registrar's own flat
 * snake_case keys, so nothing here is nested under `ca` yet.
 *
 * The stored language has no control on the form, but it is carried through so
 * saving the contact does not drop it at registrars that keep one.
 *
 * Returns undefined when the registrar has nothing stored, which leaves the
 * legal type unselected rather than guessing one.
 */
export function mapWhoisExtraToCaContactExtra(
	extra: WhoisContactExtra | undefined
): CaDomainContactExtraDetails | undefined {
	if ( ! extra?.legal_type ) {
		return undefined;
	}

	return {
		legalType: extra.legal_type,
		...( extra.lang ? { lang: extra.lang } : {} ),
	};
}

function setCaExtra(
	item: DomainContactDetails,
	edits: CaDomainContactExtraDetails
): Partial< DomainContactDetails > {
	// Return the whole `extra` object: the form merges edits shallowly, so a
	// partial one would drop the sibling `.ca` values and any other ccTLD data.
	return { extra: { ...item.extra, ca: { ...getCaExtra( item ), ...edits } } };
}

/**
 * Builds the `.ca` registrant fields for the contact form.
 */
export const getCaContactFormFields = (): Field< DomainContactDetails >[] => {
	return [
		{
			id: CA_FIELD_IDS.legalType,
			label: __( 'Choose the option that best describes your Canadian presence' ),
			Edit: 'select',
			// No default: the registrar's stored type is prefilled when known, and
			// otherwise the registrant picks one. Defaulting (to `CCT`, say) would
			// silently rewrite a corporate registrant's type on an unrelated edit.
			elements: [
				{ label: __( 'Select an option' ), value: '' },
				...Object.entries( LEGAL_TYPE_LABELS ).map( ( [ value, getLabel ] ) => ( {
					label: getLabel(),
					value,
				} ) ),
			],
			getValue: ( { item } ) => getCaExtra( item ).legalType ?? '',
			setValue: ( { item, value } ) => setCaExtra( item, { legalType: value } ),
			isValid: { required: true },
		},
	];
};

/**
 * The `.ca` field IDs to lay out, in order.
 */
export const getCaContactFormLayout = (): string[] => {
	return [ CA_FIELD_IDS.legalType ];
};
