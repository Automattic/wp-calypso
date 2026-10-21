// Shared sentence-case transform for brand-kit case rules.
//
// Both renderers (Ela documents, Bea social) need to honor a brand's
// sentence-case headline rule. CSS text-transform cannot produce sentence
// case (no `sentence-case` keyword; `::first-letter` doesn't cover the
// "rest of the word stays lowercase" part), so the transform is baked into
// the source text in JS. Keep this the single source of truth so the two
// renderers never drift apart.

// Brand proper nouns that must keep their canonical casing through a
// sentence-case transform. DESIGN.md is explicit: sentence-case headings
// still capitalize proper nouns ("Never 'automattic'"). Without this, a
// naive lowercase would mangle "WordPress.com" -> "wordpress.com". Listed
// longest-first so e.g. "WooCommerce" is restored before "Woo".
const PROTECTED_TERMS: string[] = [
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
];

function restoreProtectedTerms( s: string ): string {
	let out = s;
	for ( const term of PROTECTED_TERMS ) {
		const escaped = term.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' );
		out = out.replace( new RegExp( `\\b${ escaped }\\b`, 'gi' ), term );
	}
	return out;
}

// Lowercase the entire string then uppercase the first alphabetic character,
// producing a "Sentence case" headline regardless of how the source was
// written. Brand proper nouns are restored afterward so sentence-case never
// lowercases them.
export function applySentenceCase( s: string ): string {
	const lowered = s.toLowerCase();
	const cased = lowered.replace(
		/^([^a-z<]*)([a-z])/,
		( _m, prefix, letter ) => prefix + letter.toUpperCase()
	);
	return restoreProtectedTerms( cased );
}
