/**
 * External dependencies
 */
import { includes, some } from 'lodash';

// Check if `path` starts with `pathPrefix` and the very next character
// (if there is any) is `/` or `?`
function pathStartsWith( fullPath, pathPrefix ) {
	return (
		fullPath === pathPrefix ||
		( fullPath.slice( 0, pathPrefix.length ) === pathPrefix &&
			includes( '/?', fullPath[ pathPrefix.length ] ) )
	);
}

export function itemLinkMatches( paths, currentPath ) {
	if ( ! Array.isArray( paths ) ) {
		paths = [ paths ];
	}

	return some( paths, ( path ) => pathStartsWith( currentPath, path ) );
}
