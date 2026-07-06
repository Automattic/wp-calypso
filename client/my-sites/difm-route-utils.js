export function isPathAllowedForDIFMPreSubmitContentCollection( path, isWebsiteContentSubmitted ) {
	// Fail safe: only an explicit boolean `false` (exposed by the API while the content
	// form is open) unlocks these paths. A missing/undefined flag keeps the lockout.
	if ( isWebsiteContentSubmitted !== false ) {
		return false;
	}

	const allowedPaths = [
		'/media',
		'/posts',
		'/post',
		'/pages',
		'/page',
		'/settings/taxonomies/category',
		'/settings/taxonomies/post_tag',
	];

	return allowedPaths.some(
		( allowedPath ) => path === allowedPath || path.startsWith( `${ allowedPath }/` )
	);
}
