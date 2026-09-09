/**
 * A title field flattened to a plain string: core-data returns `raw` from an
 * edited record, `rendered` from a saved one, and a plain string from a write.
 */
export function flattenTitle( title: unknown ): string {
	if ( typeof title === 'string' ) {
		return title;
	}

	const parts = title as { raw?: string; rendered?: string } | undefined;

	return parts?.raw ?? parts?.rendered ?? '';
}
