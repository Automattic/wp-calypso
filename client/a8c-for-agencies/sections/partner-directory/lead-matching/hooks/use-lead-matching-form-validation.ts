import { useTranslate } from 'i18n-calypso';
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

const useLeadMatchingFormValidation = () => {
	const translate = useTranslate();
	const [ validationError, setValidationError ] = useState< ValidationState >( {} );

	const updateValidationError = ( newState: ValidationState ) => {
		return setValidationError( ( prev ) => ( { ...prev, ...newState } ) );
	};

	const validate = useCallback(
		( payload: LeadMatchingDetails ) => {
			const newValidationError: ValidationState = {};

			if ( payload.regions.length < 1 ) {
				newValidationError.regions = translate( 'Please select at least one region' );
			}

			if ( payload.languages.length < 1 ) {
				newValidationError.languages = translate( 'Please select at least one language' );
			}

			if ( payload.businessTypes.length < 1 ) {
				newValidationError.businessTypes = translate( 'Please select at least one business type' );
			}

			if ( payload.idealBusinessTypes.length < 1 ) {
				newValidationError.idealBusinessTypes = translate(
					'Please select at least one ideal business type'
				);
			}

			if ( payload.companySizes.length < 1 ) {
				newValidationError.companySizes = translate( 'Please select at least one company size' );
			}

			if ( payload.projectTypes.length < 1 ) {
				newValidationError.projectTypes = translate( 'Please select at least one project type' );
			}

			if ( payload.budgetLevels.length < 1 ) {
				newValidationError.budgetLevels = translate( 'Please select at least one budget level' );
			}

			if ( payload.serviceLevels.length < 1 ) {
				newValidationError.serviceLevels = translate( 'Please select at least one service level' );
			}

			if ( payload.timingPreferences.length < 1 ) {
				newValidationError.timingPreferences = translate(
					'Please select at least one timing preference'
				);
			}

			if ( payload.decisionProcesses.length < 1 ) {
				newValidationError.decisionProcesses = translate(
					'Please select at least one decision process'
				);
			}

			if ( payload.ongoingRelationships.length < 1 ) {
				newValidationError.ongoingRelationships = translate(
					'Please select at least one relationship type'
				);
			}

			if ( Object.keys( newValidationError ).length > 0 ) {
				setValidationError( newValidationError );
				return newValidationError;
			}

			return null;
		},
		[ translate ]
	);

	return { validate, validationError, updateValidationError };
};

export default useLeadMatchingFormValidation;
