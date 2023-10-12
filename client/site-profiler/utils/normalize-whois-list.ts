// Normalize a whois entry field to an array of strings
export function normalizeWhoisList( field: string | string[] | undefined ): string[] {
	if ( Array.isArray( field ) ) {
		return field;
	}

	return field ? [ field ] : [];
}
