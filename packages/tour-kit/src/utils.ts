export function classParser( classes?: string | Array< string > ) {
	if ( classes ) {
		return classes?.toString().split( ',' );
	}

	return null;
}
