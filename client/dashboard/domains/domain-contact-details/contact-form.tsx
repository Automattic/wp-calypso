import { type Domain, type DomainContactDetails } from '@automattic/api-core';
import { countryListQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
	Button,
	CheckboxControl,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { DataForm, Field, useFormValidity } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useState, useMemo } from 'react';

interface ContactFormProps {
	domain: Domain;
	initialData: DomainContactDetails;
	onSave: ( data: DomainContactDetails, transferLock: boolean ) => void;
	isSubmitting: boolean;
	validationErrors?: Record< string, string >;
}

interface ContactFormData {
	firstName?: string;
	lastName?: string;
	organization?: string;
	email?: string;
	phone?: string;
	address1?: string;
	address2?: string;
	city?: string;
	state?: string;
	postalCode?: string;
	countryCode?: string;
	fax?: string;
	vatId?: string;
	optOutTransferLock: boolean;
}

// Email validation regex
const EMAIL_REGEX =
	/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Postal code validation patterns by country
const POSTAL_CODE_PATTERNS: Record< string, RegExp > = {
	US: /^\d{5}(-\d{4})?$/,
	CA: /^[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d$/,
	GB: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i,
	DE: /^\d{5}$/,
	FR: /^\d{5}$/,
	AU: /^\d{4}$/,
	JP: /^\d{3}-?\d{4}$/,
};

// Countries that require states/provinces
const COUNTRIES_WITH_STATES = [ 'US', 'CA', 'AU', 'IN', 'BR' ];

// State data for countries that require it
const STATE_DATA: Record< string, Array< { label: string; value: string } > > = {
	US: [
		{ label: __( 'Alabama' ), value: 'AL' },
		{ label: __( 'Alaska' ), value: 'AK' },
		{ label: __( 'Arizona' ), value: 'AZ' },
		{ label: __( 'Arkansas' ), value: 'AR' },
		{ label: __( 'California' ), value: 'CA' },
		{ label: __( 'Colorado' ), value: 'CO' },
		{ label: __( 'Connecticut' ), value: 'CT' },
		{ label: __( 'Delaware' ), value: 'DE' },
		{ label: __( 'Florida' ), value: 'FL' },
		{ label: __( 'Georgia' ), value: 'GA' },
	],
	CA: [
		{ label: __( 'Alberta' ), value: 'AB' },
		{ label: __( 'British Columbia' ), value: 'BC' },
		{ label: __( 'Manitoba' ), value: 'MB' },
		{ label: __( 'New Brunswick' ), value: 'NB' },
		{ label: __( 'Newfoundland and Labrador' ), value: 'NL' },
		{ label: __( 'Northwest Territories' ), value: 'NT' },
		{ label: __( 'Nova Scotia' ), value: 'NS' },
		{ label: __( 'Nunavut' ), value: 'NU' },
		{ label: __( 'Ontario' ), value: 'ON' },
		{ label: __( 'Prince Edward Island' ), value: 'PE' },
		{ label: __( 'Quebec' ), value: 'QC' },
		{ label: __( 'Saskatchewan' ), value: 'SK' },
		{ label: __( 'Yukon' ), value: 'YT' },
	],
};

// Validators
const emailValidator = () => {
	return ( formData: ContactFormData ) => {
		const value = formData.email?.trim();
		if ( ! value ) {
			return __( 'Email is required' );
		}
		if ( ! EMAIL_REGEX.test( value ) ) {
			return __( 'Please enter a valid email address' );
		}
		if ( value.length > 254 ) {
			return __( 'Email address is too long' );
		}
		return null;
	};
};

const requiredStringValidator = ( fieldName: string, minLength = 1, maxLength = 255 ) => {
	return ( formData: ContactFormData ) => {
		const value = formData[ fieldName as keyof ContactFormData ] as string | undefined;
		if ( ! value?.trim() ) {
			return __( 'This field is required' );
		}
		if ( minLength > 1 && value.trim().length < minLength ) {
			return __( 'Value is too short' );
		}
		if ( value.trim().length > maxLength ) {
			return __( 'Value is too long' );
		}
		return null;
	};
};

const postalCodeValidator = () => {
	return ( formData: ContactFormData ) => {
		const value = formData.postalCode?.trim();
		if ( ! value ) {
			return __( 'Postal code is required' );
		}
		const postalPattern = POSTAL_CODE_PATTERNS[ formData.countryCode || '' ];
		if ( postalPattern && ! postalPattern.test( value ) ) {
			return __( 'Please enter a valid postal code for the selected country' );
		}
		if ( value.length > 20 ) {
			return __( 'Postal code is too long' );
		}
		return null;
	};
};

export default function ContactForm( {
	initialData,
	onSave,
	isSubmitting,
	validationErrors = {},
}: ContactFormProps ) {
	// Load countries data using the actual API
	const { data: countries = [] } = useSuspenseQuery( countryListQuery() );

	const [ formData, setFormData ] = useState< ContactFormData >( () => ( {
		firstName: initialData.firstName || '',
		lastName: initialData.lastName || '',
		organization: initialData.organization || '',
		email: initialData.email || '',
		phone: initialData.phone || '',
		address1: initialData.address1 || '',
		address2: initialData.address2 || '',
		city: initialData.city || '',
		state: initialData.state || '',
		postalCode: initialData.postalCode || '',
		countryCode: initialData.countryCode || '',
		fax: initialData.fax || '',
		vatId: initialData.vatId || '',
		optOutTransferLock: initialData.optOutTransferLock || false,
	} ) );

	// Get states for selected country
	const requiresState = COUNTRIES_WITH_STATES.includes( formData.countryCode || '' );
	const stateOptions = useMemo(
		() => STATE_DATA[ formData.countryCode || '' ] || [],
		[ formData.countryCode ]
	);

	// Country options for select
	const countryElements = useMemo(
		() =>
			countries.map( ( country ) => ( {
				label: country.name,
				value: country.code,
			} ) ),
		[ countries ]
	);

	// Define fields for DataForm
	const fields: Field< ContactFormData >[] = useMemo(
		() => [
			{
				id: 'firstName',
				type: 'text',
				label: __( 'First name' ),
				isValid: {
					required: true,
					custom: requiredStringValidator( 'firstName', 2, 60 ),
				},
			},
			{
				id: 'lastName',
				type: 'text',
				label: __( 'Last name' ),
				isValid: {
					required: true,
					custom: requiredStringValidator( 'lastName', 2, 60 ),
				},
			},
			{
				id: 'organization',
				type: 'text',
				label: __( 'Organization' ),
				description: __( 'Optional' ),
			},
			{
				id: 'email',
				type: 'email',
				label: __( 'Email' ),
				isValid: {
					required: true,
					custom: emailValidator(),
				},
			},
			{
				id: 'phone',
				type: 'telephone',
				label: __( 'Phone' ),
				description: __( 'Optional' ),
			},
			{
				id: 'countryCode',
				type: 'text',
				label: __( 'Country' ),
				Edit: 'select',
				elements: countryElements,
				isValid: {
					required: true,
				},
			},
			{
				id: 'address1',
				type: 'text',
				label: __( 'Address' ),
				isValid: {
					required: true,
					custom: requiredStringValidator( 'address1', 1, 255 ),
				},
			},
			{
				id: 'address2',
				type: 'text',
				label: __( 'Address line 2' ),
				description: __( 'Optional' ),
			},
			{
				id: 'city',
				type: 'text',
				label: __( 'City' ),
				isValid: {
					required: true,
					custom: requiredStringValidator( 'city', 1, 60 ),
				},
			},
			{
				id: 'state',
				type: 'text',
				label: __( 'State/Province' ),
				Edit: 'select',
				elements: stateOptions,
				isVisible: () => requiresState,
				isValid: requiresState
					? {
							required: true,
					  }
					: undefined,
			},
			{
				id: 'postalCode',
				type: 'text',
				label: __( 'Postal code' ),
				isValid: {
					required: true,
					custom: postalCodeValidator(),
				},
			},
		],
		[ countryElements, stateOptions, requiresState ]
	);

	// Form configuration
	const form = useMemo(
		() => ( {
			layout: { type: 'regular' as const },
			fields: [
				'firstName',
				'lastName',
				'organization',
				'email',
				'phone',
				'countryCode',
				'address1',
				'address2',
				'city',
				...( requiresState ? [ 'state' ] : [] ),
				'postalCode',
			],
		} ),
		[ requiresState ]
	);

	const { validity, isValid } = useFormValidity( formData, fields, form );

	const handleChange = ( edits: Partial< ContactFormData > ) => {
		const newData = { ...formData, ...edits };

		// Clear state when country changes
		if ( edits.countryCode && edits.countryCode !== formData.countryCode ) {
			newData.state = '';
		}

		setFormData( newData );
	};

	const handleSubmit = ( event: React.FormEvent ) => {
		event.preventDefault();

		if ( ! isValid ) {
			return;
		}

		// Extract transfer lock setting and contact data
		const { optOutTransferLock, ...contactData } = formData;

		// Create the complete contact data with optOutTransferLock included
		const cleanContactData: DomainContactDetails = {
			firstName: contactData.firstName,
			lastName: contactData.lastName,
			organization: contactData.organization,
			email: contactData.email,
			phone: contactData.phone,
			address1: contactData.address1,
			address2: contactData.address2,
			city: contactData.city,
			state: contactData.state,
			postalCode: contactData.postalCode,
			countryCode: contactData.countryCode,
			fax: contactData.fax,
			vatId: contactData.vatId,
			optOutTransferLock,
		};

		const transferLock = ! optOutTransferLock; // Invert because checkbox is "opt out"

		onSave( cleanContactData, transferLock );
	};

	// Merge server-side validation errors into validity object
	const mergedValidity = useMemo( () => {
		const result = { ...validity };
		Object.entries( validationErrors ).forEach( ( [ fieldId, message ] ) => {
			if ( message ) {
				result[ fieldId ] = {
					...result[ fieldId ],
					custom: { type: 'invalid' as const, message },
				};
			}
		} );
		return result;
	}, [ validity, validationErrors ] );

	return (
		<form onSubmit={ handleSubmit }>
			<VStack spacing={ 4 }>
				<DataForm< ContactFormData >
					data={ formData }
					fields={ fields }
					form={ form }
					validity={ mergedValidity }
					onChange={ handleChange }
				/>

				{ /* Transfer Lock Option - kept outside DataForm for custom help text */ }
				<CheckboxControl
					__nextHasNoMarginBottom
					label={ __( 'Opt out of 60-day transfer lock' ) }
					help={ __(
						'The 60-day transfer lock prevents unauthorized domain transfers. Opting out removes this protection.'
					) }
					checked={ formData.optOutTransferLock || false }
					onChange={ ( checked ) => handleChange( { optOutTransferLock: checked } ) }
				/>

				{ /* Form Actions */ }
				<HStack justify="flex-start" spacing={ 3 }>
					<Button
						variant="primary"
						type="submit"
						isBusy={ isSubmitting }
						disabled={ isSubmitting || ! isValid }
					>
						{ isSubmitting ? __( 'Saving…' ) : __( 'Save contact info' ) }
					</Button>
				</HStack>
			</VStack>
		</form>
	);
}
