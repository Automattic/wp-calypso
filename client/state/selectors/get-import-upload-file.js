/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Get the current import archive file being uploaded and / or operated on.
 *
 * @param {Object} state Global state tree
 * @return {Object|null} The file object or null if none
 */
export default function getImportUploadFile( state ) {
	return get( state, 'imports.uploads.file', null );
}
