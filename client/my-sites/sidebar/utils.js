/**
 * External dependencies
 */
import { includes, some } from 'lodash';

// Check if `path` starts with `pathPrefix` and the very next character
// (if there is any) is `/` or `?`
// If shallow is true, check only the very first fragment.
function pathStartsWith( fullPath, pathPrefix, shallow ) {
	if ( shallow && ! includes( [ 'types', 'marketing' ], fullPath.split( '/' )?.[ 1 ] ) ) {
		return fullPath.split( '/' )?.[ 1 ] === pathPrefix.split( '/' )?.[ 1 ];
	}
	return (
		fullPath === pathPrefix ||
		( fullPath.slice( 0, pathPrefix.length ) === pathPrefix &&
			includes( '/?', fullPath[ pathPrefix.length ] ) )
	);
}

export function itemLinkMatches( paths, currentPath, shallow = false ) {
	if ( ! Array.isArray( paths ) ) {
		paths = [ paths ];
	}

	return some( paths, ( path ) => pathStartsWith( currentPath, path, shallow ) );
}
