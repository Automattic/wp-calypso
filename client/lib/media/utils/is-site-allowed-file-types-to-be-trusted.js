/**
 * Returns true if the site can be trusted to accurately report its allowed
 * file types. Returns false otherwise.
 *
 * Jetpack currently does not sync the allowed file types
 * option, so we must assume that all file types are supported.
 *
 * @param  {Object}  site Site object
 * @returns {boolean}      Site allowed file types are accurate
 */
export function isSiteAllowedFileTypesToBeTrusted( site ) {
	if ( site?.jetpack && ! site?.is_wpcom_atomic ) {
		return false;
	}

	return true;
}
