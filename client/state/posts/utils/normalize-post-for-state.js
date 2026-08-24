/**
 * Recursively unset a value in an object by its path, represented by an array.
 * Intentionally mutates `object` to mirror native `delete` operator's behavior.
 * @param {Object} object Object to remove a property from
 * @param {Array}  path   Path to the property to remove
 */
const recursiveUnset = ( object, path ) => {
	if ( path.length > 1 ) {
		const [ , ...remainingPath ] = path;
		recursiveUnset( object[ path[ 0 ] ], remainingPath );
		return;
	}

	if ( object && object.hasOwnProperty( path[ 0 ] ) ) {
		delete object[ path[ 0 ] ];
	}
};

/**
 * Given a post object, returns a normalized post object prepared for storing
 * in the global state object.
 * @param  {Object} post Raw post object
 * @returns {Object}      Normalized post object
 */
export function normalizePostForState( post ) {
	const normalizedPost = structuredClone( post );
	return [
		[],
		...Object.entries( post.terms ?? {} ).reduce(
			( memo, [ taxonomy, terms ] ) =>
				memo.concat( Object.keys( terms ?? {} ).map( ( slug ) => [ 'terms', taxonomy, slug ] ) ),
			[]
		),
		...Object.keys( post.categories ?? {} ).map( ( slug ) => [ 'categories', slug ] ),
		...Object.keys( post.tags ?? {} ).map( ( slug ) => [ 'tags', slug ] ),
		...Object.keys( post.attachments ?? {} ).map( ( id ) => [ 'attachments', id ] ),
	].reduce( ( memo, path ) => {
		recursiveUnset( memo, path.concat( 'meta', 'links' ) );
		return memo;
	}, normalizedPost );
}
