import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import { isSiteActive } from 'calypso/a8c-for-agencies/components/form/utils';
import { AgencyDetailsSignupPayload } from 'calypso/a8c-for-agencies/sections/signup/types';
import { CAPTURE_URL_RGX } from 'calypso/blocks/import/util';
import { preventWidows } from 'calypso/lib/formatting';

const CAPTURE_SOCIAL_URL_RGX =
	/^(https?:\/\/)?(www\.)?(facebook\.com|linkedin\.com|instagram\.com)(\/.*)?$/i;

type ValidationState = {
	firstName?: string;
	lastName?: string;
	agencyName?: string;
	agencyUrl?: string;
	servicesOffered?: string;
	productsOffered?: string;
};

const useSimpleFormValidation = () => {
	const translate = useTranslate();
	const [ validationError, setValidationError ] = useState< ValidationState >( {} );
	const [ isValidating, setIsValidating ] = useState( false );

	const updateValidationError = ( newState: ValidationState ) => {
		return setValidationError( ( prev ) => ( { ...prev, ...newState } ) );
	};

	const validate = useCallback(
		async ( payload: Partial< AgencyDetailsSignupPayload > ) => {
			const newValidationError: ValidationState = {};
			setIsValidating( true );
			if ( payload.firstName?.trim() === '' ) {
				newValidationError.firstName = translate( "First name can't be empty" );
			}
			if ( payload.lastName?.trim() === '' ) {
				newValidationError.lastName = translate( "Last name can't be empty" );
			}

			if ( payload.agencyName?.trim() === '' ) {
				newValidationError.agencyName = translate( "Agency name can't be empty" );
			}

			if ( payload.agencyUrl?.trim() === '' || typeof payload.agencyUrl !== 'string' ) {
				newValidationError.agencyUrl = translate( "Agency URL can't be empty" );
			} else if ( ! CAPTURE_URL_RGX.test( payload.agencyUrl ) ) {
				newValidationError.agencyUrl = translate( 'Please enter a valid URL' );
			} else if (
				CAPTURE_SOCIAL_URL_RGX.test( payload.agencyUrl ) ||
				! ( await isSiteActive( payload.agencyUrl ) )
			) {
				newValidationError.agencyUrl = preventWidows(
					translate(
						"Please enter a valid site URL for your business. If you're experiencing issues contact us at partnerships@automattic.com"
					)
				);
			}

			if ( ! payload.servicesOffered || payload.servicesOffered?.length < 1 ) {
				newValidationError.servicesOffered = translate( 'Please select services you offer' );
			}

			if ( ! payload.productsOffered || payload.productsOffered.length < 1 ) {
				newValidationError.productsOffered = translate( 'Please select products you offer' );
			}

			if ( Object.keys( newValidationError ).length > 0 ) {
				setValidationError( newValidationError );
				return newValidationError;
			}

			setIsValidating( false );

			if ( Object.keys( newValidationError ).length > 0 ) {
				setValidationError( newValidationError );
				return newValidationError;
			}

			return null;
		},
		[ setValidationError, translate ]
	);

	return { validate, validationError, updateValidationError, isValidating };
};

export default useSimpleFormValidation;
