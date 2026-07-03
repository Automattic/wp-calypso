/**
 * Splits an ASCII identifier or phrase into words: on
 * camelCase/PascalCase boundaries, acronym runs (`XMLHttp` → `XML`, `Http`),
 * digit groups, and separators. Unlike lodash it does not deburr accents or
 * strip apostrophes — callers pass identifiers/keys, not free-form text.
 */
const WORD_PATTERN = /[A-Z]+(?=[A-Z][a-z])|[A-Z]?[a-z]+|[A-Z]+|[0-9]+/g;

export default function words( input: string ): string[] {
	return input.match( WORD_PATTERN ) ?? [];
}
