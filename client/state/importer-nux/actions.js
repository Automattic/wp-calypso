/** @format */
/**
 * Internal dependencies
 */
import { IMPORT_IS_SITE_IMPORTABLE_RECEIVE, IMPORTER_NUX_URL_INPUT_SET } from 'state/action-types';
import wpLib from 'lib/wp';
const wpcom = wpLib.undocumented();

export const setNuxUrlInputValue = value => ( {
	type: IMPORTER_NUX_URL_INPUT_SET,
	value,
} );

export const fetchIsSiteImportable = site_url => dispatch =>
	wpcom
		.isSiteImportable( site_url )
		.then( response => dispatch( { type: IMPORT_IS_SITE_IMPORTABLE_RECEIVE, ...response } ) )
		.catch( error => dispatch( { type: IMPORT_IS_SITE_IMPORTABLE_RECEIVE, error } ) );
