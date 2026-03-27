import { __ } from '@wordpress/i18n';
import { useCallback, useState } from 'react';
import { LeadMatchingDetails } from '../../types';

type ValidationState = {
	regions?: string;
	languages?: string;
	businessTypes?: string;
	idealBusinessTypes?: string;
	companySizes?: string;
	projectTypes?: string;
	budgetLevels?: string;
	serviceLevels?: string;
	timingPreferences?: string;
	decisionProcesses?: string;
	ongoingRelationships?: string;
};

export function validateLeadMatchingDetails(
	payload: LeadMatchingDetails
): ValidationState | null {
	const newValidationError: ValidationState = {};

	if ( payload.regions.length < 1 ) {
		newValidationError.regions = __( 'Please select at least one region' );
	}

	if ( payload.languages.length < 1 ) {
		newValidationError.languages = __( 'Please select at least one language' );
	}

	if ( payload.businessTypes.length < 1 ) {
		newValidationError.businessTypes = __( 'Please select at least one business type' );
	}

	if ( payload.idealBusinessTypes.length < 1 ) {
		newValidationError.idealBusinessTypes = __( 'Please select at least one ideal business type' );
	}

	if ( payload.companySizes.length < 1 ) {
		newValidationError.companySizes = __( 'Please select at least one company size' );
	}

	if ( payload.projectTypes.length < 1 ) {
		newValidationError.projectTypes = __( 'Please select at least one project type' );
	}

	if ( payload.budgetLevels.length < 1 ) {
		newValidationError.budgetLevels = __( 'Please select at least one budget level' );
	}

	if ( payload.serviceLevels.length < 1 ) {
		newValidationError.serviceLevels = __( 'Please select at least one service level' );
	}

	if ( payload.timingPreferences.length < 1 ) {
		newValidationError.timingPreferences = __( 'Please select at least one timing preference' );
	}

	if ( payload.decisionProcesses.length < 1 ) {
		newValidationError.decisionProcesses = __( 'Please select at least one decision process' );
	}

	if ( payload.ongoingRelationships.length < 1 ) {
		newValidationError.ongoingRelationships = __( 'Please select at least one relationship type' );
	}

	return Object.keys( newValidationError ).length > 0 ? newValidationError : null;
}

const useLeadMatchingFormValidation = () => {
	const [ validationError, setValidationError ] = useState< ValidationState >( {} );

	const updateValidationError = ( newState: ValidationState ) => {
		return setValidationError( ( prev ) => ( { ...prev, ...newState } ) );
	};

	const validate = useCallback( ( payload: LeadMatchingDetails ) => {
		const newValidationError = validateLeadMatchingDetails( payload );
		if ( newValidationError ) {
			setValidationError( newValidationError );
			return newValidationError;
		}

		return null;
	}, [] );

	return { validate, validationError, updateValidationError };
};

export default useLeadMatchingFormValidation;
