import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import type { BuildReportFormData } from '../types';

// Validation types
type ValidationError = {
	field: string;
	message: string;
};

// Email validation utility
const isValidEmailList = ( emailString: string ): boolean => {
	const emails = emailString.split( ',' ).map( ( email ) => email.trim() );
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emails.every( ( email ) => emailRegex.test( email ) );
};

// Validation rules for each step
const VALIDATION_RULES = {
	step1: ( data: BuildReportFormData, translate: ( key: string ) => string ): ValidationError[] => {
		const errors: ValidationError[] = [];

		if ( ! data.selectedSite?.domain.trim() ) {
			errors.push( {
				field: 'selectedSite',
				message: translate( 'Please select a site to report on.' ),
			} );
		}

		if ( ! data.clientEmail.trim() ) {
			errors.push( {
				field: 'clientEmail',
				message: translate( 'Client email is required.' ),
			} );
		} else if ( ! isValidEmailList( data.clientEmail ) ) {
			errors.push( {
				field: 'clientEmail',
				message: translate( 'Please enter valid email address.' ),
			} );
		}

		// Teammate emails validation when checkbox is checked
		if ( data.sendMeACopy ) {
			if ( ! data.teammateEmails.trim() ) {
				errors.push( {
					field: 'teammateEmails',
					message: translate( 'Teammate email(s) are required when sending to your team.' ),
				} );
			} else if ( ! isValidEmailList( data.teammateEmails ) ) {
				errors.push( {
					field: 'teammateEmails',
					message: translate( 'Please enter valid teammate email address.' ),
				} );
			}
		}

		return errors;
	},

	step2: ( data: BuildReportFormData, translate: ( key: string ) => string ): ValidationError[] => {
		const errors: ValidationError[] = [];

		// Ensure at least one stat option is selected
		const hasSelectedStats = Object.values( data.statsCheckedItems ).some( Boolean );
		if ( ! hasSelectedStats ) {
			errors.push( {
				field: 'statsCheckedItems',
				message: translate( 'Please select at least one statistic to include in the report.' ),
			} );
		}

		return errors;
	},
};

export const useFormValidation = ( currentStep: number, formData: BuildReportFormData ) => {
	const translate = useTranslate();

	return useMemo( () => {
		const validationRules = {
			1: VALIDATION_RULES.step1,
			2: VALIDATION_RULES.step2,
		};
		const validator = validationRules?.[ currentStep as keyof typeof validationRules ];
		return validator ? validator( formData, translate ) : [];
	}, [ currentStep, formData, translate ] );
};
