import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import { AgencyDetailsSignupPayload } from 'calypso/a8c-for-agencies/sections/signup/types';

type ValidationState = {
	country?: string;
	servicesOffered?: string;
	productsOffered?: string;
	productsToOffer?: string;
};

const usePersonalizationFormValidation = () => {
	const translate = useTranslate();
	const [ validationError, setValidationError ] = useState< ValidationState >( {} );

	const updateValidationError = ( newState: ValidationState ) => {
		return setValidationError( ( prev ) => ( { ...prev, ...newState } ) );
	};

	const validate = useCallback(
		async ( payload: Partial< AgencyDetailsSignupPayload > ) => {
			const newValidationError: ValidationState = {};

			if ( payload.country === '' ) {
				newValidationError.country = translate( 'Please select your country' );
			}

			if ( ! payload.servicesOffered || payload.servicesOffered?.length < 1 ) {
				newValidationError.servicesOffered = translate( 'Please select services you offer' );
			}

			if ( ! payload.productsOffered || payload.productsOffered.length < 1 ) {
				newValidationError.productsOffered = translate( 'Please select products you offer' );
			}

			if ( payload.plansToOfferProducts === 'Yes' && ! payload.productsToOffer?.length ) {
				newValidationError.productsToOffer = translate(
					'Please select products you plan to offer'
				);
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

export default usePersonalizationFormValidation;
