// Normalize a whois entry field to a string
export function normalizeWhoisField( field: string | string[] | undefined ): string {
	if ( Array.isArray( field ) ) {
		return field.length > 0 ? field[ 0 ] : '';
	}

	return field ?? '';
}
