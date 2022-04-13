export function removeTrailingSlash( str: string ) {
	return str.replace( /\/+$/, '' );
}
