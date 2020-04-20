/**
 * Internal dependencies
 */
import { filter, get, max, maxBy, startsWith } from 'lodash';
import { getSections } from 'sections-helper';

export default function pathToSection( path ) {
	// rank matches by the number of characters that match so e.g. /media won't map to /me
	const bestMatch = maxBy( getSections(), ( section ) =>
		max(
			section.paths.map( ( sectionPath ) =>
				startsWith( path, sectionPath ) ? sectionPath.length : 0
			)
		)
	);

	// sort out special case we don't want to match: matching on '/' but path isn't exactly '/'
	const matchingPaths = filter( bestMatch.paths, ( sectionPath ) =>
		startsWith( path, sectionPath )
	);
	if ( matchingPaths.length === 1 && matchingPaths[ 0 ] === '/' && path !== '/' ) {
		return null;
	}
	// make sure the best match is actually a match (in case nothing matches)
	if ( bestMatch.paths.some( ( sectionPath ) => startsWith( path, sectionPath ) ) ) {
		return get( bestMatch, 'name' );
	}
	return null;
}
