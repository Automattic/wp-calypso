/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Is the current file provided to the import UI OK to upload?
 * If true, the library has already determined it's OK or the user has confirmed.
 *
 * @param {Object} state Global state tree
 * @return {bool} Is the selected file ok to upload
 */
export default function isImportUploadFileOkToUpload( state ) {
	return !! get( state, 'imports.uploads.okToUpload' );
}
