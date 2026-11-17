export function normalizeAmplifyUrl( input: string ): string | null {
	const value = input.trim();
	if ( ! value ) {
		return null;
	}
	try {
		const url = new URL( /^[a-z][a-z\d+.-]*:\/\//i.test( value ) ? value : `https://${ value }` );
		return [ 'http:', 'https:' ].includes( url.protocol ) && url.hostname.includes( '.' )
			? url.href
			: null;
	} catch {
		return null;
	}
}
