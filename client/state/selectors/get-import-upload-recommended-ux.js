/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Get the recommended import experience for current file provided to the import UI.
 *
 * @param {Object} state Global state tree
 * @return {Object|null} The recommended experience
 */
export default function getImportUploadFileRecommendedUX( state ) {
	return get( state, 'imports.uploads.recommendedUX', { ui: 'calypso-fallback' } );
}
