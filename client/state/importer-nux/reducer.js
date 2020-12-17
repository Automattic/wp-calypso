/**
 * Internal dependencies
 */
import { combineReducers } from 'calypso/state/utils';
import {
	IMPORTER_NUX_SITE_DETAILS_SET,
	IMPORTS_IMPORT_CANCEL,
	IMPORTER_NUX_URL_INPUT_SET,
} from 'calypso/state/action-types';

import { registerActionForward } from 'calypso/lib/redux-bridge';

registerActionForward( IMPORTS_IMPORT_CANCEL );

export const urlInputValue = ( state = '', action ) => {
	switch ( action.type ) {
		case IMPORTER_NUX_URL_INPUT_SET: {
			const { value = '' } = action;
			return value;
		}
		case 'FLUX_IMPORTS_IMPORT_CANCEL':
			return '';
	}

	return state;
};

export const siteDetails = ( state = null, action ) => {
	switch ( action.type ) {
		case IMPORTER_NUX_SITE_DETAILS_SET: {
			const { siteEngine, siteFavicon, siteTitle, siteUrl, importerTypes } = action;

			return {
				siteEngine,
				siteFavicon,
				siteTitle,
				siteUrl,
				importerTypes,
			};
		}
		case 'FLUX_IMPORTS_IMPORT_CANCEL':
			return null;
	}

	return state;
};

export default combineReducers( {
	siteDetails,
	urlInputValue,
} );
