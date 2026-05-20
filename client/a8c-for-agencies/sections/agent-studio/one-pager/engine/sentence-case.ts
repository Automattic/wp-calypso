// Sentence-case transform shared by the engine and any future renderers.
// Ported from the prototype's sentenceCase.ts. CSS text-transform cannot
// produce sentence case, and html-to-image's foreignObject snapshot does not
// honor ::first-letter overrides, so the transform is baked into the source
// text in JS.

export const PROTECTED_TERMS: string[] = [
	'Automattic for Agencies',
	'WordPress VIP',
	'WordPress.com',
	'WordPress.org',
	'WooCommerce',
	'WooPayments',
	'WordPress',
	'Automattic',
	'Pressable',
	'Gravatar',
	'Jetpack',
	'Akismet',
	'Beeper',
	'Tumblr',
	'Day One',
	'Woo',
	'VIP',
].sort( ( a, b ) => b.length - a.length );

export function restoreProtectedTerms( input: string ): string {
	let output = input;
	for ( const term of PROTECTED_TERMS ) {
		const escaped = term.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' );
		output = output.replace( new RegExp( `\\b${ escaped }\\b`, 'gi' ), term );
	}
	return output;
}

export function applySentenceCase( input: string ): string {
	const lowered = input.toLowerCase();
	const cased = lowered.replace(
		/^([^a-z<]*)([a-z])/,
		( _match, prefix: string, letter: string ) => prefix + letter.toUpperCase()
	);
	return restoreProtectedTerms( cased );
}
