/**
 * Checks whether a path stays accessible during the DIFM Lite lockout while the
 * website content form is still open (content not yet submitted).
 *
 * Fail safe: only an explicit boolean `false` (exposed by the API while the content
 * form is open) unlocks these paths. A missing/undefined flag keeps the lockout.
 * @param {string} path The Calypso route being visited.
 * @param {boolean|undefined} isWebsiteContentSubmitted The `is_website_content_submitted` flag from `difm_lite_site_options`.
 * @returns {boolean} Whether the path is allowed for content collection.
 */
export function isPathAllowedForDIFMPreSubmitContentCollection( path, isWebsiteContentSubmitted ) {
	if ( isWebsiteContentSubmitted !== false ) {
		return false;
	}

	const allowedPaths = [ '/media', '/posts', '/post', '/pages', '/page' ];

	return allowedPaths.some(
		( allowedPath ) => path === allowedPath || path.startsWith( `${ allowedPath }/` )
	);
}
