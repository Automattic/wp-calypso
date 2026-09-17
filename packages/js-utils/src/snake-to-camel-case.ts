/**
 * Convert a snake_case_word to a camelCaseWord.
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
