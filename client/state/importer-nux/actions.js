/**
 * Internal dependencies
 */
import {
	IMPORTER_NUX_SITE_DETAILS_SET,
	IMPORTER_NUX_URL_INPUT_SET,
} from 'calypso/state/action-types';

import 'calypso/state/importer-nux/init';

export const setNuxUrlInputValue = ( value ) => ( {
	type: IMPORTER_NUX_URL_INPUT_SET,
	value,
} );

export const setImportOriginSiteDetails = ( response ) => ( {
	type: IMPORTER_NUX_SITE_DETAILS_SET,
	...response,
} );
