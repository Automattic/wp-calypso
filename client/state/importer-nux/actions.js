/** @format */
/**
 * Internal dependencies
 */
import {
	IMPORT_IS_SITE_IMPORTABLE_ERROR,
	IMPORT_IS_SITE_IMPORTABLE_RECEIVE,
	IMPORTER_NUX_URL_INPUT_SET,
	IMPORTER_NUX_URL_VALIDATION_SET,
	IMPORT_IS_SITE_IMPORTABLE_START_FETCH,
} from 'state/action-types';
import wpLib from 'lib/wp';
const wpcom = wpLib.undocumented();

export const setNuxUrlInputValue = value => ( {
	type: IMPORTER_NUX_URL_INPUT_SET,
	value,
} );

export const setValidationMessage = message => ( {
	type: IMPORTER_NUX_URL_VALIDATION_SET,
	message,
} );

export const setImportOriginSiteDetails = response => ( {
	type: IMPORT_IS_SITE_IMPORTABLE_RECEIVE,
	...response,
} );

export const fetchIsSiteImportable = site_url => dispatch => {
	dispatch( {
		type: IMPORT_IS_SITE_IMPORTABLE_START_FETCH,
	} );

	return wpcom
		.isSiteImportable( site_url )
		.then( ( { engine, favicon, site_title: siteTitle, site_url: siteUrl } ) =>
			dispatch(
				setImportOriginSiteDetails( {
					engine,
					favicon,
					siteTitle,
					siteUrl,
				} )
			)
		)
		.catch( error => dispatch( { type: IMPORT_IS_SITE_IMPORTABLE_ERROR, error } ) );
};
