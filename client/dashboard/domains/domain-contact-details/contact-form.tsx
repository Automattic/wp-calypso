import { type Domain, type DomainContactDetails } from '@automattic/api-core';
import { countryListQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
	Button,
	CheckboxControl,
	SelectControl,
	TextControl,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState, useMemo } from 'react';
import { validatePhone } from '../../utils/phone-number';

interface ContactFormProps {
	domain: Domain;
	initialData: DomainContactDetails;
	onSave: ( data: DomainContactDetails, transferLock: boolean ) => void;
	isSubmitting: boolean;
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

// Email validation regex - more comprehensive
const EMAIL_REGEX =
	/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Postal code validation patterns by country
const POSTAL_CODE_PATTERNS: Record< string, RegExp > = {
	US: /^\d{5}(-\d{4})?$/, // 12345 or 12345-6789
	CA: /^[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d$/, // A1A 1A1 or A1A1A1
	GB: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i, // SW1A 1AA
	DE: /^\d{5}$/, // 12345
	FR: /^\d{5}$/, // 12345
	AU: /^\d{4}$/, // 1234
	JP: /^\d{3}-?\d{4}$/, // 123-4567 or 1234567
};

// Countries that require states/provinces
const COUNTRIES_WITH_STATES = [ 'US', 'CA', 'AU', 'IN', 'BR' ];

// Simple state data for countries that require it
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
		// Add more states as needed
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

export default function ContactForm( { initialData, onSave, isSubmitting }: ContactFormProps ) {
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
	const stateOptions = STATE_DATA[ formData.countryCode || '' ] || [];

	// Country options for select
	const countryOptions = useMemo(
		() =>
			countries.map( ( country ) => ( {
				label: country.name,
				value: country.code,
			} ) ),
		[ countries ]
	);

	// Enhanced form validation
	const validateForm = ( data: ContactFormData ): Record< string, string > => {
		const errors: Record< string, string > = {};

		// Required fields validation
		if ( ! data.firstName?.trim() ) {
			errors.firstName = __( 'First name is required' );
		} else if ( data.firstName.trim().length < 2 ) {
			errors.firstName = __( 'First name must be at least 2 characters' );
		} else if ( data.firstName.trim().length > 60 ) {
			errors.firstName = __( 'First name must be less than 60 characters' );
		}

		if ( ! data.lastName?.trim() ) {
			errors.lastName = __( 'Last name is required' );
		} else if ( data.lastName.trim().length < 2 ) {
			errors.lastName = __( 'Last name must be at least 2 characters' );
		} else if ( data.lastName.trim().length > 60 ) {
			errors.lastName = __( 'Last name must be less than 60 characters' );
		}

		// Email validation
		if ( ! data.email?.trim() ) {
			errors.email = __( 'Email is required' );
		} else if ( ! EMAIL_REGEX.test( data.email.trim() ) ) {
			errors.email = __( 'Please enter a valid email address' );
		} else if ( data.email.trim().length > 254 ) {
			errors.email = __( 'Email address is too long' );
		}

		// Country validation
		if ( ! data.countryCode ) {
			errors.countryCode = __( 'Country is required' );
		}

		// Address validation
		if ( ! data.address1?.trim() ) {
			errors.address1 = __( 'Address is required' );
		} else if ( data.address1.trim().length > 255 ) {
			errors.address1 = __( 'Address is too long' );
		}

		if ( data.address2 && data.address2.trim().length > 255 ) {
			errors.address2 = __( 'Address line 2 is too long' );
		}

		// City validation
		if ( ! data.city?.trim() ) {
			errors.city = __( 'City is required' );
		} else if ( data.city.trim().length > 60 ) {
			errors.city = __( 'City name is too long' );
		}

		// State validation for countries that require it
		if ( requiresState && ! data.state?.trim() ) {
			errors.state = __( 'State/Province is required' );
		}

		// Postal code validation
		if ( ! data.postalCode?.trim() ) {
			errors.postalCode = __( 'Postal code is required' );
		} else {
			const postalPattern = POSTAL_CODE_PATTERNS[ data.countryCode || '' ];
			if ( postalPattern && ! postalPattern.test( data.postalCode.trim() ) ) {
				errors.postalCode = __( 'Please enter a valid postal code for the selected country' );
			} else if ( data.postalCode.trim().length > 20 ) {
				errors.postalCode = __( 'Postal code is too long' );
			}
		}

		// Phone validation (if provided)
		if ( data.phone?.trim() ) {
			const phoneValidation = validatePhone( data.phone.trim() );
			if ( phoneValidation.error ) {
				errors.phone = phoneValidation.message;
			}
		}

		// Organization validation (if provided)
		if ( data.organization && data.organization.trim().length > 255 ) {
			errors.organization = __( 'Organization name is too long' );
		}

		return errors;
	};

	const [ validationErrors, setValidationErrors ] = useState< Record< string, string > >( {} );

	const handleFieldChange = ( changes: Partial< ContactFormData > ) => {
		const newData = { ...formData, ...changes };

		// Clear state when country changes
		if ( changes.countryCode && changes.countryCode !== formData.countryCode ) {
			newData.state = '';
		}

		setFormData( newData );

		// Clear validation errors for changed fields
		const newErrors = { ...validationErrors };
		Object.keys( changes ).forEach( ( key ) => {
			delete newErrors[ key ];
		} );

		// Also clear state error when country changes
		if ( changes.countryCode ) {
			delete newErrors.state;
		}

		setValidationErrors( newErrors );
	};

	const handleSubmit = ( event: React.FormEvent ) => {
		event.preventDefault();

		const errors = validateForm( formData );
		if ( Object.keys( errors ).length > 0 ) {
			setValidationErrors( errors );
			// Focus first error field
			const firstErrorField = Object.keys( errors )[ 0 ];
			const element = document.querySelector( `[name="${ firstErrorField }"]` ) as HTMLElement;
			element?.focus();
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
			optOutTransferLock, // Include this in the contact data
		};

		const transferLock = ! optOutTransferLock; // Invert because checkbox is "opt out"

		onSave( cleanContactData, transferLock );
	};

	return (
		<form onSubmit={ handleSubmit }>
			<VStack spacing={ 4 }>
				{ /* Contact Information Fields */ }
				<TextControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					label={ __( 'First name' ) }
					value={ formData.firstName || '' }
					onChange={ ( value ) => handleFieldChange( { firstName: value } ) }
					help={ validationErrors.firstName }
					className={ validationErrors.firstName ? 'has-error' : '' }
				/>

				<TextControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					label={ __( 'Last name' ) }
					value={ formData.lastName || '' }
					onChange={ ( value ) => handleFieldChange( { lastName: value } ) }
					help={ validationErrors.lastName }
					className={ validationErrors.lastName ? 'has-error' : '' }
				/>

				<TextControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					label={ __( 'Organization' ) }
					value={ formData.organization || '' }
					onChange={ ( value ) => handleFieldChange( { organization: value } ) }
					help={ validationErrors.organization || __( 'Optional' ) }
					className={ validationErrors.organization ? 'has-error' : '' }
				/>

				<TextControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					type="email"
					label={ __( 'Email' ) }
					value={ formData.email || '' }
					onChange={ ( value ) => handleFieldChange( { email: value } ) }
					help={ validationErrors.email }
					className={ validationErrors.email ? 'has-error' : '' }
				/>

				<TextControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					type="tel"
					label={ __( 'Phone' ) }
					value={ formData.phone || '' }
					onChange={ ( value ) => handleFieldChange( { phone: value } ) }
					help={ validationErrors.phone || __( 'Include country code (e.g., +1 555–123–4567)' ) }
					className={ validationErrors.phone ? 'has-error' : '' }
				/>

				<SelectControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					label={ __( 'Country' ) }
					value={ formData.countryCode || '' }
					options={ [ { label: __( 'Select country' ), value: '' }, ...countryOptions ] }
					onChange={ ( value ) => handleFieldChange( { countryCode: value } ) }
					help={ validationErrors.countryCode }
					className={ validationErrors.countryCode ? 'has-error' : '' }
				/>

				<TextControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					label={ __( 'Address' ) }
					value={ formData.address1 || '' }
					onChange={ ( value ) => handleFieldChange( { address1: value } ) }
					help={ validationErrors.address1 }
					className={ validationErrors.address1 ? 'has-error' : '' }
				/>

				<TextControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					label={ __( 'Address line 2' ) }
					value={ formData.address2 || '' }
					onChange={ ( value ) => handleFieldChange( { address2: value } ) }
					help={ validationErrors.address2 || __( 'Optional' ) }
					className={ validationErrors.address2 ? 'has-error' : '' }
				/>

				<TextControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					label={ __( 'City' ) }
					value={ formData.city || '' }
					onChange={ ( value ) => handleFieldChange( { city: value } ) }
					help={ validationErrors.city }
					className={ validationErrors.city ? 'has-error' : '' }
				/>

				{ requiresState && (
					<SelectControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ __( 'State/Province' ) }
						value={ formData.state || '' }
						options={ [ { label: __( 'Select state/province' ), value: '' }, ...stateOptions ] }
						onChange={ ( value ) => handleFieldChange( { state: value } ) }
						help={ validationErrors.state }
						className={ validationErrors.state ? 'has-error' : '' }
					/>
				) }

				<TextControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					label={ __( 'Postal code' ) }
					value={ formData.postalCode || '' }
					onChange={ ( value ) => handleFieldChange( { postalCode: value } ) }
					help={ validationErrors.postalCode }
					className={ validationErrors.postalCode ? 'has-error' : '' }
				/>

				{ /* Transfer Lock Option */ }
				<CheckboxControl
					__nextHasNoMarginBottom
					label={ __( 'Opt out of 60-day transfer lock' ) }
					help={ __(
						'The 60-day transfer lock prevents unauthorized domain transfers. Opting out removes this protection.'
					) }
					checked={ formData.optOutTransferLock || false }
					onChange={ ( checked ) => handleFieldChange( { optOutTransferLock: checked } ) }
				/>

				{ /* Form Actions */ }
				<HStack justify="flex-start" spacing={ 3 }>
					<Button variant="primary" type="submit" isBusy={ isSubmitting } disabled={ isSubmitting }>
						{ __( 'Save contact info' ) }
					</Button>
				</HStack>
			</VStack>
		</form>
	);
}
