/**
 * Convert a camelCaseWord to a snake_case_word.
 *
 * This is designed to work nearly identically to the lodash `snakeCase`
 * function. Notably:
 *
 * - Leading and trailing spaces are removed.
 * - Leading and trailing underscores are removed.
 * - Spaces are collapsed into a single underscore.
 * - Numbers are considered to be capital letters of a different type.
 * - Multiple adjacent captial letters of the same type are considered part of the same word.
 */
export function camelToSnakeCase( camelCaseString: string ): string {
	return (
		camelCaseString
			// collapse all spaces into an underscore
			.replace( /\s+/g, '_' )
			// wrap underscores around capitalized words
			.replace( /[A-Z][a-z]+/g, ( letter: string ): string => `_${ letter.toLowerCase() }_` )
			// wrap underscores around capital letter groups
			.replace( /[A-Z]+/g, ( letter: string ): string => `_${ letter.toLowerCase() }_` )
			// wrap underscores around number groups
			.replace( /[0-9]+/g, ( letter: string ): string => `_${ letter }_` )
			// remove duplicate underscores
			.replace( /_+/g, '_' )
			// strip leading/trailing underscores
			.replace( /(^_)|(_$)/g, '' )
	);
}
