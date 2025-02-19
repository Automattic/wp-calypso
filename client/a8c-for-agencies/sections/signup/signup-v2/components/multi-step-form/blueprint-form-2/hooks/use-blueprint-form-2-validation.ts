import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import { AgencyDetailsSignupPayload } from 'calypso/a8c-for-agencies/sections/signup/types';

type ValidationState = {
	workWithClients?: string;
};

const useBlueprintForm2Validation = () => {
	const translate = useTranslate();
	const [ validationError, setValidationError ] = useState< ValidationState >( {} );

	const updateValidationError = ( newState: ValidationState ) => {
		return setValidationError( ( prev ) => ( { ...prev, ...newState } ) );
	};

	const validate = useCallback(
		async ( payload: Partial< AgencyDetailsSignupPayload > ) => {
			const newValidationError: ValidationState = {};

			if ( payload.workWithClients === '' ) {
				newValidationError.workWithClients = translate( `Please select an option` );
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

export default useBlueprintForm2Validation;
