/**
 * Internal dependencies
 */
import {
	IMPORTER_NUX_SITE_DETAILS_SET,
	IMPORTER_NUX_URL_INPUT_SET,
	IMPORTER_NUX_FROM_SIGNUP_CLEAR,
	IMPORTER_NUX_FROM_SIGNUP_SET,
} from 'state/action-types';

export const setNuxUrlInputValue = ( value ) => ( {
	type: IMPORTER_NUX_URL_INPUT_SET,
	value,
} );

export const setImportOriginSiteDetails = ( response ) => ( {
	type: IMPORTER_NUX_SITE_DETAILS_SET,
	...response,
} );

export const setImportingFromSignupFlow = () => ( {
	type: IMPORTER_NUX_FROM_SIGNUP_SET,
} );

export const clearImportingFromSignupFlow = () => ( {
	type: IMPORTER_NUX_FROM_SIGNUP_CLEAR,
} );
