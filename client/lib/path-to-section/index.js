import { filter, maxBy } from 'lodash';
import { getSections } from 'calypso/sections-helper';

export default function pathToSection( path ) {
	// rank matches by the number of characters that match so e.g. /media won't map to /me
	const bestMatch = maxBy( getSections(), ( section ) =>
		Math.max(
			...section.paths.map( ( sectionPath ) =>
				( path ?? '' ).startsWith( sectionPath ) ? sectionPath.length : 0
			)
		)
	);

	// sort out special case we don't want to match: matching on '/' but path isn't exactly '/'
	const matchingPaths = filter( bestMatch.paths, ( sectionPath ) =>
		( path ?? '' ).startsWith( sectionPath )
	);
	if ( matchingPaths.length === 1 && matchingPaths[ 0 ] === '/' && path !== '/' ) {
		return null;
	}
	// make sure the best match is actually a match (in case nothing matches)
	if ( bestMatch.paths.some( ( sectionPath ) => ( path ?? '' ).startsWith( sectionPath ) ) ) {
		return bestMatch?.name;
	}
	return null;
}
