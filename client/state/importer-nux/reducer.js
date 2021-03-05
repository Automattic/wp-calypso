/**
 * Internal dependencies
 */
import { combineReducers } from 'calypso/state/utils';
import {
	IMPORTER_NUX_SITE_DETAILS_SET,
	IMPORTER_NUX_URL_INPUT_SET,
} from 'calypso/state/action-types';

export const urlInputValue = ( state = '', action ) => {
	switch ( action.type ) {
		case IMPORTER_NUX_URL_INPUT_SET: {
			const { value = '' } = action;
			return value;
		}
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
	}

	return state;
};

export default combineReducers( {
	siteDetails,
	urlInputValue,
} );
