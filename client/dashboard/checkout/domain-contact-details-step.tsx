import {
	validateDomainWhois,
	type ContactValidationRequestContactInformation,
	type DomainContactValidationResponse,
	type DomainContactValidationRequestExtraFields,
} from '@automattic/api-core';
import { countryListQuery, statesListQuery } from '@automattic/api-queries';
import { useIsStepActive } from '@automattic/composite-checkout';
import { useQuery } from '@tanstack/react-query';
import {
	CheckboxControl,
	RadioControl,
	SelectControl,
	TextControl,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { DataForm } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { Card, CardBody, CardDivider } from '../components/card';
import type {
	DomainContactDetails,
	ResponseCart,
	TaxLocationUpdate,
	CaDomainContactExtraDetails,
	UkDomainContactExtraDetails,
	FrDomainContactExtraDetails,
} from '@automattic/shopping-cart';
import type { Field } from '@wordpress/dataviews';

/**
 * Returns all unique top-level TLDs from a list of domain names.
 * For example, ["foo.ca", "bar.co.uk"] → ["ca", "uk"].
 */
function getAllTopLevelTlds( domainNames: string[] ): string[] {
	return Array.from(
		new Set( domainNames.map( ( name ) => name.substring( name.lastIndexOf( '.' ) + 1 ) ) )
	).sort();
}

/**
 * Extra fields for .ca domain registrations: legal type and CIRA agreement.
 */
function CaExtraFields( {
	data,
	onChange,
}: {
	data: CaDomainContactExtraDetails;
	onChange: ( updated: Partial< DomainContactDetails > ) => void;
} ) {
	// Initialize required defaults on mount so they are included in validation.
	useEffect( () => {
		const defaults: Partial< CaDomainContactExtraDetails > = {};
		if ( ! data.legalType ) {
			defaults.legalType = 'CCT';
		}
		if ( ! data.lang ) {
			defaults.lang = 'EN';
		}
		if ( data.ciraAgreementAccepted === undefined ) {
			defaults.ciraAgreementAccepted = false;
		}
		if ( Object.keys( defaults ).length > 0 ) {
			onChange( { extra: { ca: defaults } } );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	const legalType = data.legalType ?? 'CCT';
	const ciraAgreementAccepted = data.ciraAgreementAccepted ?? false;

	const legalTypeOptions = [
		{ label: __( 'Canadian Citizen' ), value: 'CCT' },
		{ label: __( 'Canadian Corporation' ), value: 'CCO' },
		{ label: __( 'Permanent Resident' ), value: 'RES' },
		{ label: __( 'Government' ), value: 'GOV' },
		{ label: __( 'Educational Institution' ), value: 'EDU' },
		{ label: __( 'Unincorporated Association' ), value: 'ASS' },
		{ label: __( 'Hospital' ), value: 'HOP' },
		{ label: __( 'Partnership' ), value: 'PRT' },
		{ label: __( 'Trademark Owner' ), value: 'TDM' },
		{ label: __( 'Trade Union' ), value: 'TRD' },
		{ label: __( 'Political Party' ), value: 'PLT' },
		{ label: __( 'Library, Archive, or Museum' ), value: 'LAM' },
		{ label: __( 'Trust' ), value: 'TRS' },
		{ label: __( 'Aboriginal Peoples' ), value: 'ABO' },
		{ label: __( 'Indian Band' ), value: 'INB' },
		{ label: __( 'Legal Representative' ), value: 'LGR' },
		{ label: __( 'Official Mark' ), value: 'OMK' },
		{ label: __( 'His Majesty the King' ), value: 'MAJ' },
	];

	return (
		<VStack spacing={ 4 }>
			<p>{ __( 'We need some extra details to register your .ca domain.' ) }</p>
			<SelectControl
				label={ __( 'Choose the option that best describes your Canadian presence:' ) }
				value={ legalType }
				options={ legalTypeOptions }
				onChange={ ( value ) => onChange( { extra: { ca: { legalType: value } } } ) }
			/>
			<CheckboxControl
				label={ __( 'I have read and agree to the CIRA Registrant Agreement.' ) }
				help={
					<a
						href="https://www.cira.ca/en/resources/documents/about/registrant-agreement/"
						target="_blank"
						rel="noopener noreferrer"
					>
						{ __( 'Read the CIRA Registrant Agreement' ) }
					</a>
				}
				checked={ ciraAgreementAccepted }
				onChange={ ( checked ) =>
					onChange( { extra: { ca: { ciraAgreementAccepted: checked } } } )
				}
			/>
		</VStack>
	);
}

/**
 * Extra fields for .uk domain registrations: registrant type, and conditionally
 * trading name and registration number.
 */
function UkExtraFields( {
	data,
	onChange,
}: {
	data: UkDomainContactExtraDetails;
	onChange: ( updated: Partial< DomainContactDetails > ) => void;
} ) {
	// Initialize required defaults on mount.
	useEffect( () => {
		if ( ! data.registrantType ) {
			onChange( { extra: { uk: { registrantType: 'IND' } } } );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	const registrantType = data.registrantType ?? 'IND';
	const tradingName = data.tradingName ?? '';
	const registrationNumber = data.registrationNumber ?? '';

	const registrantTypeOptions = [
		{ label: __( 'Individual' ), value: 'IND' },
		{ label: __( 'Foreign Individual' ), value: 'FIND' },
		{ label: __( 'UK Sole Trader' ), value: 'STRA' },
		{ label: __( 'UK Partnership' ), value: 'PTNR' },
		{ label: __( 'UK Limited Company' ), value: 'LTD' },
		{ label: __( 'UK Limited Liability Partnership' ), value: 'LLP' },
		{ label: __( 'UK Corporation by Royal Charter' ), value: 'CRC' },
		{ label: __( 'Non-UK Corporation' ), value: 'FCORP' },
		{ label: __( 'UK Industrial/Provident Registered Company' ), value: 'IP' },
		{ label: __( 'UK Public Limited Company' ), value: 'PLC' },
		{ label: __( 'UK School' ), value: 'SCH' },
		{ label: __( 'UK Government Body' ), value: 'GOV' },
		{ label: __( 'UK Registered Charity' ), value: 'RCHAR' },
		{ label: __( 'UK Statutory Body' ), value: 'STAT' },
		{ label: __( 'UK Entity that does not fit another category' ), value: 'OTHER' },
		{ label: __( 'Non-UK Entity that does not fit another category' ), value: 'FOTHER' },
	];

	const tradingNameRequired = [
		'LTD',
		'PLC',
		'LLP',
		'IP',
		'RCHAR',
		'FCORP',
		'OTHER',
		'FOTHER',
		'STRA',
	].includes( registrantType );
	const registrationNumberRequired = [ 'LTD', 'PLC', 'LLP', 'IP', 'SCH', 'RCHAR' ].includes(
		registrantType
	);

	return (
		<VStack spacing={ 4 }>
			<p>{ __( 'We need some extra details to register your .uk domain.' ) }</p>
			<SelectControl
				label={ __( 'Choose the option that best describes your presence in the United Kingdom:' ) }
				value={ registrantType }
				options={ registrantTypeOptions }
				onChange={ ( value ) => onChange( { extra: { uk: { registrantType: value } } } ) }
			/>
			{ tradingNameRequired && (
				<TextControl
					label={ __( 'Trading name' ) }
					value={ tradingName }
					onChange={ ( value ) => onChange( { extra: { uk: { tradingName: value } } } ) }
					autoCapitalize="off"
					autoComplete="off"
					autoCorrect="off"
				/>
			) }
			{ registrationNumberRequired && (
				<TextControl
					label={ __( 'Registration number' ) }
					value={ registrationNumber }
					onChange={ ( value ) => onChange( { extra: { uk: { registrationNumber: value } } } ) }
					autoCapitalize="off"
					autoComplete="off"
					autoCorrect="off"
				/>
			) }
		</VStack>
	);
}

/**
 * Sanitizes a VAT string by keeping only digits, letters, plus, and asterisk.
 */
function sanitizeVat( value: string ): string {
	return value.toUpperCase().replace( /[^0-9A-Z+*]/g, '' );
}

/**
 * Sanitizes a string by keeping only digits.
 */
function sanitizeNumeric( value: string ): string {
	return value.replace( /[^0-9]/g, '' );
}

/**
 * Extra fields for .fr domain registrations: registrant type (individual or organization),
 * and conditionally organization-specific fields.
 */
function FrExtraFields( {
	data,
	contactDetails,
	onChange,
}: {
	data: FrDomainContactExtraDetails;
	contactDetails: DomainContactDetails;
	onChange: ( updated: Partial< DomainContactDetails > ) => void;
} ) {
	// Initialize default registrant type based on whether an organization name is present.
	useEffect( () => {
		if ( ! data.registrantType ) {
			const defaultType = contactDetails.organization ? 'organization' : 'individual';
			onChange( { extra: { fr: { registrantType: defaultType } } } );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	const registrantType = data.registrantType ?? 'individual';
	const registrantVatId = data.registrantVatId ?? '';
	const sirenSiret = data.sirenSiret ?? '';
	const trademarkNumber = data.trademarkNumber ?? '';

	return (
		<VStack spacing={ 4 }>
			<p>{ __( 'We need some extra details to register your .fr domain.' ) }</p>
			<RadioControl
				label={ __( "Who's this domain for?" ) }
				selected={ registrantType }
				options={ [
					{ label: __( 'An individual' ), value: 'individual' },
					{ label: __( 'A company or organization' ), value: 'organization' },
				] }
				onChange={ ( value ) => onChange( { extra: { fr: { registrantType: value } } } ) }
			/>
			{ registrantType === 'organization' && (
				<VStack spacing={ 4 }>
					<TextControl
						label={ __( 'Organization name' ) }
						value={ contactDetails.organization ?? '' }
						onChange={ ( value ) => onChange( { organization: value } ) }
						autoCapitalize="off"
						autoComplete="off"
						autoCorrect="off"
					/>
					<TextControl
						label={ __( 'VAT number' ) }
						value={ registrantVatId }
						placeholder={ __( 'ex. FRXX123456789' ) }
						onChange={ ( value ) => {
							const sanitized = sanitizeVat( value );
							// VAT is stored both in extra.fr and the top-level vatId field.
							onChange( { vatId: sanitized, extra: { fr: { registrantVatId: sanitized } } } );
						} }
						autoCapitalize="off"
						autoComplete="off"
						autoCorrect="off"
						help={ __( 'Optional' ) }
					/>
					<TextControl
						label={ __( 'SIREN or SIRET number' ) }
						value={ sirenSiret }
						inputMode="numeric"
						placeholder={ __( 'ex. 123 456 789 or 123 456 789 01234' ) }
						onChange={ ( value ) =>
							onChange( { extra: { fr: { sirenSiret: sanitizeNumeric( value ) } } } )
						}
						autoCapitalize="off"
						autoComplete="off"
						autoCorrect="off"
						help={ __( 'Optional' ) }
					/>
					<TextControl
						label={ __( 'EU trademark number' ) }
						value={ trademarkNumber }
						inputMode="numeric"
						placeholder={ __( 'ex. 012345678' ) }
						onChange={ ( value ) =>
							onChange( { extra: { fr: { trademarkNumber: sanitizeNumeric( value ) } } } )
						}
						autoCapitalize="off"
						autoComplete="off"
						autoCorrect="off"
						help={ __( 'Optional' ) }
					/>
				</VStack>
			) }
		</VStack>
	);
}

export const defaultDomainContactDetails: DomainContactDetails = {
	firstName: '',
	lastName: '',
	email: '',
	phone: '',
	organization: '',
	address1: '',
	address2: '',
	city: '',
	state: '',
	postalCode: '',
	countryCode: '',
	fax: '',
	vatId: '',
};

/**
 * Extracts cart tax location data from domain contact details.
 * Used when the domain contact step also serves as the billing address step.
 */
export function getCartLocationFromContactDetails(
	details: DomainContactDetails
): TaxLocationUpdate {
	return {
		countryCode: details.countryCode,
		postalCode: details.postalCode,
		subdivisionCode: details.state,
		vatId: details.vatId,
		organization: details.organization,
		address: details.address1,
		city: details.city,
	};
}

/**
 * Returns true if the cart contains any domain registrations or transfers,
 * which require domain contact details to be collected.
 */
export function cartHasDomainProduct( responseCart: ResponseCart ): boolean {
	return responseCart.products.some(
		( product ) => product.is_domain_registration || product.product_slug === 'domain_transfer'
	);
}

/**
 * Extracts domain names from cart products for use in the validation API call.
 */
export function getDomainNamesFromCart( responseCart: ResponseCart ): string[] {
	return responseCart.products
		.filter(
			( product ) => product.is_domain_registration || product.product_slug === 'domain_transfer'
		)
		.map( ( product ) => product.meta )
		.filter( Boolean ) as string[];
}

/**
 * Converts camelCase DomainContactDetails to the snake_case format expected
 * by the validation API endpoint, including TLD-specific extra fields.
 */
function convertToValidationRequest(
	details: DomainContactDetails
): ContactValidationRequestContactInformation {
	const request: ContactValidationRequestContactInformation = {
		first_name: details.firstName,
		last_name: details.lastName,
		organization: details.organization,
		email: details.email,
		phone: details.phone,
		address_1: details.address1,
		address_2: details.address2,
		city: details.city,
		state: details.state,
		postal_code: details.postalCode,
		country_code: details.countryCode,
		fax: details.fax,
		vat_id: details.vatId,
	};

	if ( details.extra ) {
		const extra: DomainContactValidationRequestExtraFields = {};

		if ( details.extra.ca ) {
			extra.ca = {
				lang: details.extra.ca.lang,
				legal_type: details.extra.ca.legalType,
				cira_agreement_accepted: details.extra.ca.ciraAgreementAccepted,
			};
		}

		if ( details.extra.uk ) {
			extra.uk = {
				registrant_type: details.extra.uk.registrantType,
				registration_number: details.extra.uk.registrationNumber,
				trading_name: details.extra.uk.tradingName,
			};
		}

		if ( details.extra.fr ) {
			extra.fr = {
				registrant_type: details.extra.fr.registrantType,
				registrant_vat_id: details.extra.fr.registrantVatId,
				trademark_number: details.extra.fr.trademarkNumber,
				siren_siret: details.extra.fr.sirenSiret,
			};
		}

		request.extra = extra;
	}

	return request;
}

/**
 * Validates domain contact details against the WPCOM API.
 * Returns true if validation passed, false otherwise.
 */
export async function validateDomainContactDetails(
	contactDetails: DomainContactDetails,
	domainNames: string[],
	onValidationError?: ( response: DomainContactValidationResponse ) => void
): Promise< boolean > {
	try {
		const validationParams = convertToValidationRequest( contactDetails );
		const response = await validateDomainWhois( validationParams, domainNames );

		if ( ! response.success ) {
			onValidationError?.( response );
			return false;
		}

		return true;
	} catch {
		return false;
	}
}

/**
 * Domain contact details form built with DataForm, following the same pattern
 * as TaxLocationForm.
 */
function DomainContactDetailsForm( {
	data,
	onChange,
}: {
	data: DomainContactDetails;
	onChange: ( updated: Partial< DomainContactDetails > ) => void;
} ) {
	const { data: countryList } = useQuery( countryListQuery() );

	const selectedCountryCode = data?.countryCode;
	const { data: statesList } = useQuery( {
		...statesListQuery( selectedCountryCode?.toLowerCase() || '' ),
		enabled: !! selectedCountryCode,
	} );

	const fields = useMemo(
		(): Field< DomainContactDetails >[] => [
			{
				id: 'countryCode',
				label: __( 'Country' ),
				Edit: 'select',
				elements: ( countryList || [] )
					.filter( ( c ) => c.name )
					.map( ( c ) => ( { label: c.name, value: c.code } ) ),
			},
			{ id: 'firstName', label: __( 'First name' ), Edit: 'text' },
			{ id: 'lastName', label: __( 'Last name' ), Edit: 'text' },
			{ id: 'email', label: __( 'Email address' ), Edit: 'text' },
			{ id: 'phone', label: __( 'Phone' ), Edit: 'text' },
			{ id: 'organization', label: __( 'Organization' ), Edit: 'text' },
			{ id: 'address1', label: __( 'Address' ), Edit: 'text' },
			{ id: 'address2', label: __( 'Address line 2' ), Edit: 'text' },
			{ id: 'city', label: __( 'City' ), Edit: 'text' },
			{
				id: 'state',
				label: __( 'State/Province' ),
				Edit: statesList && statesList.length > 0 ? 'select' : 'text',
				elements:
					statesList && statesList.length > 0
						? statesList.map( ( s ) => ( { label: s.name, value: s.code } ) )
						: undefined,
			},
			{ id: 'postalCode', label: __( 'Postal code' ), Edit: 'text' },
		],
		[ countryList, statesList ]
	);

	const form = useMemo(
		() => ( {
			type: 'regular' as const,
			labelPosition: 'top' as const,
			fields: [
				'countryCode',
				'firstName',
				'lastName',
				'email',
				'phone',
				'organization',
				'address1',
				'address2',
				'city',
				'state',
				'postalCode',
			],
		} ),
		[]
	);

	if ( ! countryList ) {
		return null;
	}

	return (
		<DataForm< DomainContactDetails >
			data={ data }
			fields={ fields }
			form={ form }
			onChange={ onChange }
		/>
	);
}

/**
 * Step title — switches between short and long form based on active state.
 * When `isAlsoBillingStep` is true (domain contact doubles as the billing step),
 * uses more generic "contact information" language.
 */
export function DomainContactDetailsStepTitle( {
	isAlsoBillingStep = false,
}: {
	isAlsoBillingStep?: boolean;
} = {} ) {
	const isActive = useIsStepActive();
	if ( isAlsoBillingStep ) {
		return <>{ isActive ? __( 'Enter your contact information' ) : __( 'Contact information' ) }</>;
	}
	return <>{ isActive ? __( 'Enter your domain contact details' ) : __( 'Domain contact' ) }</>;
}

/**
 * Active step content — shows the contact details form and any TLD-specific
 * extra fields inside a card.
 */
export function DomainContactDetailsStepContent( {
	contactDetails,
	onContactDetailsChange,
	domainNames,
}: {
	contactDetails: DomainContactDetails;
	onContactDetailsChange: ( updated: Partial< DomainContactDetails > ) => void;
	domainNames: string[];
} ) {
	const tlds = getAllTopLevelTlds( domainNames );
	const hasCa = tlds.includes( 'ca' );
	const hasUk = tlds.includes( 'uk' );
	const hasFr = tlds.includes( 'fr' );
	const hasTldExtras = hasCa || hasUk || hasFr;

	return (
		<Card>
			<CardBody>
				<VStack spacing={ 4 }>
					<DomainContactDetailsForm data={ contactDetails } onChange={ onContactDetailsChange } />
				</VStack>
			</CardBody>
			{ hasTldExtras && (
				<>
					<CardDivider />
					<CardBody>
						<VStack spacing={ 6 }>
							{ hasCa && (
								<CaExtraFields
									data={ contactDetails.extra?.ca ?? {} }
									onChange={ onContactDetailsChange }
								/>
							) }
							{ hasUk && (
								<UkExtraFields
									data={ contactDetails.extra?.uk ?? {} }
									onChange={ onContactDetailsChange }
								/>
							) }
							{ hasFr && (
								<FrExtraFields
									data={ contactDetails.extra?.fr ?? {} }
									contactDetails={ contactDetails }
									onChange={ onContactDetailsChange }
								/>
							) }
						</VStack>
					</CardBody>
				</>
			) }
		</Card>
	);
}

/**
 * Summary shown when the step is complete — displays name and email.
 */
export function DomainContactDetailsSummary( {
	contactDetails,
}: {
	contactDetails: DomainContactDetails;
} ) {
	const parts: string[] = [];

	const name = [ contactDetails.firstName, contactDetails.lastName ].filter( Boolean ).join( ' ' );
	if ( name ) {
		parts.push( name );
	}
	if ( contactDetails.email ) {
		parts.push( contactDetails.email );
	}

	return <div>{ parts.join( ' · ' ) }</div>;
}

/**
 * Hook to manage domain contact details state with a stable change handler.
 * Deep-merges the `extra` field to avoid overwriting sibling TLD details when
 * a single TLD-specific field changes.
 */
export function useDomainContactDetailsState( initialValue?: DomainContactDetails ) {
	const [ contactDetails, setContactDetails ] = useState< DomainContactDetails >(
		initialValue ?? defaultDomainContactDetails
	);

	const handleContactDetailsChange = useCallback( ( updated: Partial< DomainContactDetails > ) => {
		setContactDetails( ( current ) => {
			if ( updated.extra ) {
				// Deep-merge each TLD's extra fields so updating one field doesn't
				// wipe out other fields in the same or sibling TLD objects.
				const mergedExtra = { ...current.extra };
				if ( updated.extra.ca !== undefined ) {
					mergedExtra.ca = { ...current.extra?.ca, ...updated.extra.ca };
				}
				if ( updated.extra.uk !== undefined ) {
					mergedExtra.uk = { ...current.extra?.uk, ...updated.extra.uk };
				}
				if ( updated.extra.fr !== undefined ) {
					mergedExtra.fr = { ...current.extra?.fr, ...updated.extra.fr };
				}
				return { ...current, ...updated, extra: mergedExtra };
			}
			return { ...current, ...updated };
		} );
	}, [] );

	return {
		contactDetails,
		setContactDetails,
		handleContactDetailsChange,
	};
}
