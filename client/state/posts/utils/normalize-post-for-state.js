import { cloneDeep, map, reduce } from 'lodash';

/**
 * Recursively unset a value in an object by its path, represented by an array.
 * Intentionally mutates `object` to mirror native `delete` operator's behavior.
 *
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
 *
 * @param  {Object} post Raw post object
 * @returns {Object}      Normalized post object
 */
export function normalizePostForState( post ) {
	const normalizedPost = cloneDeep( post );
	return reduce(
		[
			[],
			...reduce(
				post.terms,
				( memo, terms, taxonomy ) =>
					memo.concat( map( terms, ( term, slug ) => [ 'terms', taxonomy, slug ] ) ),
				[]
			),
			...map( post.categories, ( category, slug ) => [ 'categories', slug ] ),
			...map( post.tags, ( tag, slug ) => [ 'tags', slug ] ),
			...map( post.attachments, ( attachment, id ) => [ 'attachments', id ] ),
		],
		( memo, path ) => {
			recursiveUnset( memo, path.concat( 'meta', 'links' ) );
			return memo;
		},
		normalizedPost
	);
}
