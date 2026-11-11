import { __ } from '@wordpress/i18n';
import type {
	DomainContactDetails,
	UkDomainContactExtraDetails,
	WhoisContactExtra,
} from '@automattic/api-core';
import type { Field } from '@wordpress/dataviews';

/**
 * `.uk` registrant types accepted by the registrar, as listed in the `.uk`
 * validation schema. The labels match the ones used at checkout so a registrant
 * sees the same wording when buying and when editing.
 * @see http://domains.opensrs.guide/docs/tld#section-uk
 */
const REGISTRANT_TYPE_LABELS: Record< string, () => string > = {
	IND: () => __( 'Individual' ),
	FIND: () => __( 'Foreign Individual' ),
	STRA: () =>
		/* translators: refers to the UK legal concept of self-employment/sole proprietorship */
		__( 'UK Sole Trader' ),
	PTNR: () => __( 'UK Partnership' ),
	LTD: () => __( 'UK Limited Company' ),
	LLP: () => __( 'UK Limited Liability Partnership' ),
	CRC: () => __( 'UK Corporation by Royal Charter' ),
	FCORP: () => __( 'Non-UK Corporation' ),
	IP: () => __( 'UK Industrial/Provident Registered Company' ),
	PLC: () => __( 'UK Public Limited Company' ),
	SCH: () => __( 'UK School' ),
	GOV: () => __( 'UK Government Body' ),
	RCHAR: () => __( 'UK Registered Charity' ),
	STAT: () => __( 'UK Statutory Body' ),
	OTHER: () => __( 'UK Entity that does not fit another category' ),
	FOTHER: () => __( 'Non-UK Entity that does not fit another category' ),
};

const TRADING_NAME_REQUIRED_FOR = [
	'LTD',
	'PLC',
	'LLP',
	'IP',
	'RCHAR',
	'FCORP',
	'OTHER',
	'FOTHER',
	'STRA',
];

const REGISTRATION_NUMBER_REQUIRED_FOR = [ 'LTD', 'PLC', 'LLP', 'IP', 'SCH', 'RCHAR' ];

const REGISTRATION_NUMBER_PATTERN = '^([a-zA-Z]{2}[0-9]{6}|[a-zA-Z][0-9]{7}|[0-9]{6,8})$';

const TRADING_NAME_MIN_LENGTH = 4;

export const UK_FIELD_IDS = {
	registrantType: 'ukRegistrantType',
	tradingName: 'ukTradingName',
	registrationNumber: 'ukRegistrationNumber',
} as const;

/**
 * Maps each `.uk` form field to the dotted path the validation endpoint reports
 * its errors under, so a server message can be attached to the right control.
 */
export const UK_FIELD_TO_API_KEY_MAP: Record< string, string > = {
	[ UK_FIELD_IDS.registrantType ]: 'extra.uk.registrant_type',
	[ UK_FIELD_IDS.tradingName ]: 'extra.uk.trading_name',
	[ UK_FIELD_IDS.registrationNumber ]: 'extra.uk.registration_number',
};

/**
 * Every `.uk` second-level domain (.uk, .co.uk, .me.uk, .org.uk) shares the same
 * registrant-type contract, so the top-level suffix is the only check needed.
 */
export function isUkDomain( domainName: string ) {
	return domainName.toLowerCase().endsWith( '.uk' );
}

export function hasUkDomain( domainNames: string[] ) {
	return domainNames.some( isUkDomain );
}

export function getUkExtra( data: DomainContactDetails ): UkDomainContactExtraDetails {
	return data.extra?.uk ?? {};
}

/**
 * Converts the registrar's stored `.uk` registrant details into the shape the
 * form holds them in. The WHOIS read returns the registrar's own flat snake_case
 * keys, so nothing here is nested under `uk` yet.
 *
 * Returns undefined when the registrar has nothing stored, which leaves the
 * registrant type unselected rather than guessing one.
 */
export function mapWhoisExtraToUkContactExtra(
	extra: WhoisContactExtra | undefined
): UkDomainContactExtraDetails | undefined {
	if ( ! extra?.registrant_type ) {
		return undefined;
	}

	return {
		registrantType: extra.registrant_type,
		...( extra.trading_name ? { tradingName: extra.trading_name } : {} ),
		...( extra.registration_number ? { registrationNumber: extra.registration_number } : {} ),
	};
}

function setUkExtra(
	item: DomainContactDetails,
	edits: UkDomainContactExtraDetails
): Partial< DomainContactDetails > {
	// Return the whole `extra` object: the form merges edits shallowly, so a
	// partial one would drop the sibling `.uk` values and any other ccTLD data.
	return { extra: { ...item.extra, uk: { ...getUkExtra( item ), ...edits } } };
}

/**
 * Sets the registrant type, dropping the conditional values the new type does
 * not ask for.
 *
 * Hiding those fields is not enough: their values stay on the payload, and the
 * registrar validates a registration number's format whenever one is present,
 * whatever the registrant type. A number left behind by an earlier selection
 * would fail validation with no control on screen to correct it.
 */
function setUkRegistrantType(
	item: DomainContactDetails,
	registrantType: string
): Partial< DomainContactDetails > {
	const { tradingName, registrationNumber, ...rest } = getUkExtra( item );

	return {
		extra: {
			...item.extra,
			uk: {
				...rest,
				registrantType,
				...( requiresTradingName( registrantType ) && tradingName ? { tradingName } : {} ),
				...( requiresRegistrationNumber( registrantType ) && registrationNumber
					? { registrationNumber }
					: {} ),
			},
		},
	};
}

export function requiresTradingName( registrantType?: string ) {
	return !! registrantType && TRADING_NAME_REQUIRED_FOR.includes( registrantType );
}

export function requiresRegistrationNumber( registrantType?: string ) {
	return !! registrantType && REGISTRATION_NUMBER_REQUIRED_FOR.includes( registrantType );
}

/**
 * Builds the `.uk` registrant fields for the contact form.
 *
 * The trading name and registration number are only included when the selected
 * registrant type calls for them: DataForm's `required` rule is static, so
 * omitting the field entirely is what keeps Save correctly gated as the type
 * changes.
 */
export const getUkContactFormFields = (
	registrantType: string | undefined
): Field< DomainContactDetails >[] => {
	const fields: Field< DomainContactDetails >[] = [
		{
			id: UK_FIELD_IDS.registrantType,
			label: __( 'Choose the option that best describes your presence in the United Kingdom' ),
			Edit: 'select',
			// No default: the registrar's stored type is prefilled when known, and
			// otherwise the registrant picks one. Defaulting (to `IND`, say) would
			// silently rewrite a business registrant's type on an unrelated edit.
			elements: [
				{ label: __( 'Select an option' ), value: '' },
				...Object.entries( REGISTRANT_TYPE_LABELS ).map( ( [ value, getLabel ] ) => ( {
					label: getLabel(),
					value,
				} ) ),
			],
			getValue: ( { item } ) => getUkExtra( item ).registrantType ?? '',
			setValue: ( { item, value } ) => setUkRegistrantType( item, value ),
			isValid: { required: true },
		},
	];

	if ( requiresTradingName( registrantType ) ) {
		fields.push( {
			id: UK_FIELD_IDS.tradingName,
			label: __( 'Trading name' ),
			type: 'text',
			getValue: ( { item } ) => getUkExtra( item ).tradingName ?? '',
			setValue: ( { item, value } ) => setUkExtra( item, { tradingName: value } ),
			isValid: { required: true, minLength: TRADING_NAME_MIN_LENGTH },
		} );
	}

	if ( requiresRegistrationNumber( registrantType ) ) {
		fields.push( {
			id: UK_FIELD_IDS.registrationNumber,
			label: __( 'Registration number' ),
			type: 'text',
			getValue: ( { item } ) => getUkExtra( item ).registrationNumber ?? '',
			setValue: ( { item, value } ) => setUkExtra( item, { registrationNumber: value } ),
			isValid: { required: true, pattern: REGISTRATION_NUMBER_PATTERN },
		} );
	}

	return fields;
};

/**
 * The `.uk` field IDs to lay out, in order, for the current registrant type.
 */
export const getUkContactFormLayout = ( registrantType: string | undefined ): string[] => {
	const layout: string[] = [ UK_FIELD_IDS.registrantType ];

	if ( requiresTradingName( registrantType ) ) {
		layout.push( UK_FIELD_IDS.tradingName );
	}

	if ( requiresRegistrationNumber( registrantType ) ) {
		layout.push( UK_FIELD_IDS.registrationNumber );
	}

	return layout;
};
