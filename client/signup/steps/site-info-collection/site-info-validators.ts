import { translate } from 'i18n-calypso';
import { ReactChild } from 'react';
import {
	SITE_INFO_FIELDS,
	SITE_INFO_SECTIONS,
} from 'calypso/state/signup/steps/site-info-collection/schema';

export type ErrorMap = {
	[ key: string ]: Array< ReactChild >;
};
type ValidationResult = {
	isValid: boolean;
	detailedErrors: ErrorMap;
};

export const validateField = ( fieldName: keyof typeof SITE_INFO_FIELDS ) => (
	value: string
): Array< ReactChild > => {
	switch ( fieldName ) {
		case SITE_INFO_FIELDS.siteTitle: {
			const isValid = value?.length > 0;
			if ( ! isValid ) {
				return [ translate( 'Please enter a valid site title.' ) ];
			}
			return [];
		}
		default:
			return [];
	}
};

// Mapping between section and validated fields
const { siteTitle, siteDescription } = SITE_INFO_SECTIONS;
const VALIDATED_FIELDS_PER_SECTION: {
	[ key in keyof typeof SITE_INFO_SECTIONS ]?: Array< keyof typeof SITE_INFO_FIELDS >;
} = {
	[ siteTitle ]: [ SITE_INFO_FIELDS.siteTitle ],
	[ siteDescription ]: [ SITE_INFO_FIELDS.siteDescription ],
};

export const validateSection = ( sectionID: keyof typeof SITE_INFO_SECTIONS ) => (
	values: Record< string, string >
): ValidationResult => {
	const sectionErrorMap: ValidationResult = { isValid: false, detailedErrors: {} };
	let isSectionValid = true;
	const validatedFields = VALIDATED_FIELDS_PER_SECTION[ sectionID ];
	validatedFields &&
		validatedFields.forEach( ( fieldId ) => {
			const validationResult = validateField( fieldId )( values[ fieldId ] );
			sectionErrorMap.detailedErrors[ fieldId ] = validationResult;
			isSectionValid = isSectionValid && validationResult.length === 0;
		} );

	sectionErrorMap.isValid = isSectionValid;
	return sectionErrorMap;
};

export const validateAll = ( values: Record< string, string > ): ValidationResult => {
	const errorMap: ValidationResult = { isValid: false, detailedErrors: {} };
	let isAllValid = true;
	const fields = Object.keys( SITE_INFO_FIELDS );
	fields.forEach( ( fieldId ) => {
		const validationResult = validateField( fieldId as keyof typeof SITE_INFO_FIELDS )(
			values[ fieldId ]
		);
		errorMap.detailedErrors[ fieldId ] = validationResult;
		isAllValid = isAllValid && validationResult.length === 0;
	} );
	errorMap.isValid = isAllValid;

	return errorMap;
};
