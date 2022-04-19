export function redirect( to: string ) {
	window.location.href = to;
}

export function removeTrailingSlash( str: string ) {
	return str.replace( /\/+$/, '' );
}

export function removeLeadingSlash( str: string ) {
	return str.replace( /^\/+/, '' );
}
