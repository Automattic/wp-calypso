export function isPathAllowedForDIFMPreSubmitContentCollection( path, isWebsiteContentSubmitted ) {
	if ( isWebsiteContentSubmitted ) {
		return false;
	}

	const allowedPaths = [ '/media', '/posts', '/post', '/pages', '/page', '/settings/taxonomies' ];

	return allowedPaths.some(
		( allowedPath ) => path === allowedPath || path.startsWith( `${ allowedPath }/` )
	);
}
