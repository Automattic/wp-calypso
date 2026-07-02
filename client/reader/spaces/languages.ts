import languages from '@automattic/languages';

/**
 * A selectable language for a Space. `code` is the base ES language code the API
 * stores and filters on (e.g. `pt`, `en`); `name` is the human label shown in
 * the picker (the language's native name, matching the WordPress.com language
 * picker — e.g. `Português`, `English`).
 */
export interface SpaceLanguageOption {
	code: string;
	name: string;
}

/**
 * Reduce a locale or language slug to its base ES language code: strip the
 * region/variant and lowercase (`pt-br` → `pt`, `en_US` → `en`, `EN` → `en`).
 * Mirrors the server-side normalization (`preg_split('/[\-_]/', $code)[0]`) so
 * the client and API agree on what a base code is.
 */
export function toBaseLanguageCode( slug: string ): string {
	return slug.toLowerCase().split( /[-_]/ )[ 0 ];
}

// Build one option per base language. Many entries in `@automattic/languages`
// are regional variants (`pt-br`, `en-gb`); collapse them onto their base code,
// preferring the canonical base entry's native name (`langSlug === base`) when
// it exists so we show `Português`, not `Português do Brasil`, for `pt`.
const optionsByCode = new Map< string, SpaceLanguageOption >();
for ( const language of languages ) {
	const code = toBaseLanguageCode( language.langSlug );
	const isCanonicalBase = language.langSlug === code;
	if ( isCanonicalBase || ! optionsByCode.has( code ) ) {
		optionsByCode.set( code, { code, name: language.name } );
	}
}

/** All selectable base languages, sorted by display name. */
export const SPACE_LANGUAGE_OPTIONS: SpaceLanguageOption[] = Array.from(
	optionsByCode.values()
).sort( ( a, b ) => a.name.localeCompare( b.name ) );

/** Suggestion strings (display names) for the FormTokenField dropdown. */
export const SPACE_LANGUAGE_SUGGESTIONS: string[] = SPACE_LANGUAGE_OPTIONS.map(
	( option ) => option.name
);

const nameByCode = new Map(
	SPACE_LANGUAGE_OPTIONS.map( ( option ) => [ option.code, option.name ] )
);
const codeByLowerName = new Map(
	SPACE_LANGUAGE_OPTIONS.map( ( option ) => [ option.name.toLowerCase(), option.code ] )
);

/** Whether a base code is a known/selectable language. */
export function isKnownLanguageCode( code: string ): boolean {
	return nameByCode.has( code );
}

/** Display name for a base code, falling back to the code itself if unknown. */
export function getLanguageName( code: string ): string {
	return nameByCode.get( code ) ?? code;
}

/**
 * Resolve a display name back to its base code (case-insensitive), or
 * `undefined` if it isn't a known language. Used to translate the token field's
 * name-based tokens back into the codes the API stores.
 */
export function getLanguageCodeByName( name: string ): string | undefined {
	return codeByLowerName.get( name.trim().toLowerCase() );
}

/** A token as `FormTokenField` reports it on change — a raw string or `{ value }`. */
type LanguageToken = string | { value: string };

/**
 * Convert the token field's tokens (display names) back into the base codes the
 * API stores, de-duped and order-preserving.
 *
 * A token may also be an unknown code that the field is showing verbatim: the
 * display path renders an unrecognized stored code as-is (`getLanguageName`
 * falls back to the code), and the server validates against a locale list that
 * can outgrow `@automattic/languages`. So we first match a token against the
 * names of the codes already in state — which round-trips an unknown code back
 * to itself — and only then fall back to the known-language lookup. This keeps a
 * stored-but-unrecognized language from being silently dropped on the next edit.
 */
export function resolveLanguageTokens( tokens: LanguageToken[], currentCodes: string[] ): string[] {
	const codeByCurrentName = new Map(
		currentCodes.map( ( code ) => [ getLanguageName( code ), code ] )
	);
	const codes = tokens
		.map( ( token ) => ( typeof token === 'string' ? token : token.value ) )
		.map( ( name ) => codeByCurrentName.get( name ) ?? getLanguageCodeByName( name ) )
		.filter( ( code ): code is string => code !== undefined );
	return Array.from( new Set( codes ) );
}
