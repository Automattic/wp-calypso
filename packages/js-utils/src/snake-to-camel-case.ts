/**
 * Convert a snake_case_word to a camelCaseWord.
 *
 * This is designed to work nearly identically to the lodash `camelCase` function.
 */
export default function snakeToCamelCase( snakeCaseString: string | undefined ): string {
	if ( ! snakeCaseString ) {
		return '';
	}
	return snakeCaseString
		.toLowerCase()
		.replace( /([-_][a-z0-9])/g, ( group ) =>
			group.toUpperCase().replace( '-', '' ).replace( '_', '' )
		);
}
