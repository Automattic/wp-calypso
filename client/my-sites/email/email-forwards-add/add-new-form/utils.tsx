export function isValidMailbox( mailbox: string ) {
	const allowedSpecialChars = "!#$%&'*+/=?^_`{|}~.";

	if ( mailbox.length === 0 || mailbox.length > 64 ) {
		return false;
	}

	if ( mailbox.length > 64 ) {
		return false;
	}

	for ( const char of mailbox ) {
		if ( ! /[a-zA-Z0-9]/.test( char ) && ! allowedSpecialChars.includes( char ) ) {
			return false;
		}
	}

	if ( /\.{2,}/.test( mailbox ) || mailbox.startsWith( '.' ) || mailbox.endsWith( '.' ) ) {
		return false;
	}

	return true;
}
