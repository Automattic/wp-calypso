/** @format */

/**
 * Internal dependencies
 */

import config from 'config';
import { last, max, sortBy, startsWith } from 'lodash';

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
	const rankedMatches = sortBy( sections, section =>
		max(
			section.paths.map(
				sectionPath => ( startsWith( path, sectionPath ) ? sectionPath.length : 0 )
			)
		)
	);
	return rankedMatches && last( rankedMatches ) && last( rankedMatches ).name;
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
