/**
 * Helper to convert CSV of `classes` to an array.
 *
 * @param classes String or array of classes to format.
 * @returns Array of classes
 */
export function classParser( classes?: string | string[] ): string[] | null {
	if ( classes?.length ) {
		return classes?.toString().split( ',' );
	}

	return null;
}
