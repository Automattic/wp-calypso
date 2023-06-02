/**
 * Returns an array of supported file extensions for the specified site.
 *
 * @param  {Object} site Site object
 * @returns {Array}      Supported file extensions
 */
export function getAllowedFileTypesForSite( site ) {
	if ( ! site ) {
		return [];
	}

	return site.options.allowed_file_types;
}
