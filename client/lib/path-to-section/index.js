/**
 * Internal dependencies
 */
import config from 'config';
import { find, startsWith } from 'lodash';

/**
 * Conditional dependency
 */
const sections = config( 'project' ) === 'wordpress-com'
	? require( 'wordpress-com' )
	: null;

/*
 * wordpress-com-aware implementation where
 *
 *  f( '/' ) === 'reader"
 *  f( '/me' ) === 'me"
 *  f( '/me/account' ) === 'me"
 *  f( '/read' ) === 'reader'
 */
export const wpcomImplementation = path => {
	const match = find( sections, section =>
			section.paths.some( sectionPath =>
				startsWith( path, sectionPath ) ) );

	return match && match.name;
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

const pathToSection = sections
	? wpcomImplementation
	: fallbackImplementation;

export default pathToSection;
