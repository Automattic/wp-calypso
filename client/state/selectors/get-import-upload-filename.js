/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import getImportUploadFile from 'state/selectors/get-import-upload-file';

/**
 * Get the name of the current import archive file being uploaded and / or operated on.
 *
 * @param {Object} state Global state tree
 * @return {string} The name of the file (empty string if none)
 */
export default function getImportUploadFilename( state ) {
	return get( getImportUploadFile( state ), 'name', '' );
}
