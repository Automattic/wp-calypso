import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import { isSiteActive } from 'calypso/a8c-for-agencies/components/form/utils';
import { preventWidows } from 'calypso/lib/formatting';
import { AgencyDetailsPayload } from '../types';

export const CAPTURE_URL_RGX =
	/^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([-.][a-z0-9]+)*\.[a-z]{2,63}(:[0-9]{1,5})?(\/.*)?$/i;
const CAPTURE_SOCIAL_URL_RGX =
	/^(https?:\/\/)?(www\.)?(facebook\.com|linkedin\.com|instagram\.com)(\/.*)?$/i;

type ValidationState = {
	firstName?: string;
	lastName?: string;
	agencyName?: string;
	agencyUrl?: string;
	line1?: string;
	city?: string;
	country?: string;
};

const useSignupFormValidation = () => {
	const translate = useTranslate();
	const [ validationError, setValidationError ] = useState< ValidationState >( {} );

	const updateValidationError = ( newState: ValidationState ) => {
		return setValidationError( ( prev ) => ( { ...prev, ...newState } ) );
	};

	const validate = useCallback(
		async ( payload: AgencyDetailsPayload ) => {
			const newValidationError: ValidationState = {};
			if ( payload.firstName === '' ) {
				newValidationError.firstName = translate( `First name can't be empty` );
			}
			if ( payload.lastName === '' ) {
				newValidationError.lastName = translate( `Last name can't be empty` );
			}

			if ( payload.agencyName === '' ) {
				newValidationError.agencyName = translate( `Agency name can't be empty` );
			}

			if ( payload.agencyUrl === '' ) {
				newValidationError.agencyUrl = translate( `Agency URL can't be empty` );
			} else if ( ! CAPTURE_URL_RGX.test( payload.agencyUrl ) ) {
				newValidationError.agencyUrl = translate( `Please enter a valid URL` );
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

			if ( payload.line1 === '' ) {
				newValidationError.line1 = translate( `Address can't be empty` );
			}

			if ( payload.city === '' ) {
				newValidationError.city = translate( `City can't be empty` );
			}

			if ( payload.country === '' ) {
				newValidationError.country = translate( `Please select your country` );
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

export default useSignupFormValidation;
