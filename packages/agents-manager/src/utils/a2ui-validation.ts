export function validateA2uiTextField(
	value: string,
	pattern?: string
): 'valid' | 'invalid-value' | 'invalid-pattern' {
	if ( pattern === undefined ) {
		return 'valid';
	}
	try {
		const regexp = new RegExp( pattern );
		return ! value || regexp.test( value ) ? 'valid' : 'invalid-value';
	} catch {
		return 'invalid-pattern';
	}
}
