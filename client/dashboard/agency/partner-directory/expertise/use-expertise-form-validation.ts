import { sprintf, __ } from '@wordpress/i18n';
import { useCallback, useState } from 'react';
import { areUrlsUnique, isValidUrl } from '../lib';
import { CLIENT_SITE_URLS_COUNT } from './use-expertise-form';
import type { ExpertiseFormData } from './use-expertise-form';

export interface ExpertiseValidationState {
	services?: string;
	products?: string;
	directories?: string;
	clientSites?: string;
	feedbackUrl?: string;
}

export default function useExpertiseFormValidation() {
	const [ validationError, setValidationError ] = useState< ExpertiseValidationState >( {} );

	const updateValidationError = useCallback(
		( newState: ExpertiseValidationState ) =>
			setValidationError( ( previous ) => ( { ...previous, ...newState } ) ),
		[]
	);

	const validate = useCallback( ( payload: ExpertiseFormData ) => {
		const newValidationError: ExpertiseValidationState = {};

		if ( payload.services.length < 1 ) {
			newValidationError.services = __( 'Services can’t be empty' );
		}

		if ( payload.products.length < 1 ) {
			newValidationError.products = __( 'Products can’t be empty' );
		}

		if ( payload.directories.length < 1 ) {
			newValidationError.directories = __( 'Directories can’t be empty' );
		} else {
			for ( const directory of payload.directories ) {
				// Already-approved directories keep their reviewed URLs, so they
				// aren't validated again.
				if ( directory.status === 'approved' ) {
					continue;
				}

				if ( directory.urls.length < CLIENT_SITE_URLS_COUNT ) {
					newValidationError.clientSites = sprintf(
						/* translators: %d is the number of client site URLs required per directory */
						__( 'Please provide %d client site URLs for each directory' ),
						CLIENT_SITE_URLS_COUNT
					);
					break;
				}
				if ( directory.urls.some( ( url ) => ! isValidUrl( url ) ) ) {
					newValidationError.clientSites = __( 'Please provide valid URLs' );
					break;
				}
				if ( ! areUrlsUnique( directory.urls ) ) {
					newValidationError.clientSites = __( 'URLs should be unique' );
					break;
				}
			}
		}

		if ( payload.feedbackUrl === '' ) {
			newValidationError.feedbackUrl = __( 'Feedback URL can’t be empty' );
		} else if ( ! isValidUrl( payload.feedbackUrl ) ) {
			newValidationError.feedbackUrl = __( 'Please enter a valid URL' );
		}

		if ( Object.keys( newValidationError ).length > 0 ) {
			setValidationError( newValidationError );
			return newValidationError;
		}

		return null;
	}, [] );

	return { validate, validationError, updateValidationError };
}
