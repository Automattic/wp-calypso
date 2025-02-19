import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import { AgencyDetailsSignupPayload } from 'calypso/a8c-for-agencies/sections/signup/types';

type ValidationState = {
	topPartneringGoal?: string;
	topYearlyGoal?: string;
};

const useBlueprintFormValidation = () => {
	const translate = useTranslate();
	const [ validationError, setValidationError ] = useState< ValidationState >( {} );

	const updateValidationError = ( newState: ValidationState ) => {
		return setValidationError( ( prev ) => ( { ...prev, ...newState } ) );
	};

	const validate = useCallback(
		async ( payload: Partial< AgencyDetailsSignupPayload > ) => {
			const newValidationError: ValidationState = {};

			if ( payload.topPartneringGoal === '' ) {
				newValidationError.topPartneringGoal = translate( `Please select a goal` );
			}

			if ( payload.topYearlyGoal === '' ) {
				newValidationError.topYearlyGoal = translate( `Please select a goal` );
			}

			if ( Object.keys( newValidationError ).length > 0 ) {
				setValidationError( newValidationError );
				return newValidationError;
			}

			return null;
		},
		[ setValidationError, translate ]
	);

	return { validate, validationError, updateValidationError };
};

export default useBlueprintFormValidation;
