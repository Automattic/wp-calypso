/**
 * Builds a partial update object from a path and value.
 * Example: buildPartialUpdate(['settings', 'theme'], 'dark') returns { settings: { theme: 'dark' } }
 * @param path - Array of keys representing the path
 * @param value - The value to set
 * @returns A partial object representing the update
 */
export function buildPartialUpdate( path: readonly string[], value: unknown ): object {
	if ( path.length === 0 ) {
		return value as object;
	}

	const [ first, ...rest ] = path;
	return {
		[ first ]: rest.length === 0 ? value : buildPartialUpdate( rest, value ),
	};
}
