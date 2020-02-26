export function removeSlug( path ) {
	if ( ! path ) {
		return;
	}

	const pathParts = path.slice( 0, -1 ).split( '/' );
	pathParts[ pathParts.length - 1 ] = '';

	return pathParts.join( '/' );
}
