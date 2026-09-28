export function getDeploymentTypeFromPath( path: string ) {
	if ( path === '/' ) {
		return 'root';
	}
	if ( path === '/wp-content' ) {
		return 'wp-content';
	}
	if ( path.includes( 'wp-content/plugins' ) ) {
		return 'plugin';
	}
	if ( path.includes( 'wp-content/themes' ) ) {
		return 'theme';
	}
	return 'unknown';
}

// Only the API error code is reported; `message` is free text and would leak
// repository names and paths into Tracks.
export function getDeploymentErrorReason( error: Error ) {
	return 'code' in error && typeof error.code === 'string' ? error.code : undefined;
}
