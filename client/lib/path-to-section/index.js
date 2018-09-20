/** @format */

/**
 * Internal dependencies
 */

import config from 'config';
import { filter, get, max, maxBy, startsWith } from 'lodash';

/**
 * Conditional dependency
 */
const sections = config( 'project' ) === 'wordpress-com' ? require( 'wordpress-com' ) : null;

/*
 * wordpress-com-aware implementation where
 *
 *  f( '/' ) === 'reader"
 *  f( '/me' ) === 'me"
 *  f( '/me/account' ) === 'account"
 *  f( '/read' ) === 'reader'
 */
export const wpcomImplementation = path => {
	// rank matches by the number of characters that match so e.g. /media won't map to /me
	const bestMatch = maxBy( sections, section =>
		max(
			section.paths.map(
				sectionPath => ( startsWith( path, sectionPath ) ? sectionPath.length : 0 )
			)
		)
	);

	// sort out special case we don't want to match: matching on '/' but path isn't exactly '/'
	const matchingPaths = filter( bestMatch.paths, sectionPath => startsWith( path, sectionPath ) );
	if ( matchingPaths.length === 1 && matchingPaths[ 0 ] === '/' && path !== '/' ) {
		return null;
	}
	// make sure the best match is actually a match (in case nothing matches)
	if ( bestMatch.paths.some( sectionPath => startsWith( path, sectionPath ) ) ) {
		return get( bestMatch, 'name' );
	}
	return null;
};

/*
 * Dead-simple alternative implementation where
 *
 * 	f( '/' ) === null
 * 	f( '/foo/bar' ) === 'foo'
 */
export const fallbackImplementation = path => {
	const match = path.match( /[^/]+/ );
	return match && match[ 0 ];
};

const pathToSection = sections ? wpcomImplementation : fallbackImplementation;

export default pathToSection;
