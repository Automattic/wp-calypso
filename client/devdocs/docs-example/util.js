/**
 * /* eslint-disable no-console
 *
 */

/**
 * External dependencies
 */
import debug from 'debug';

/**
 * Module variables
 */
const log = debug( 'calypso:docs-example:util' );

const getComponentName = ( docsExample ) => {
	if ( ! docsExample ) {
		return '';
	}

	if ( docsExample.props.asyncName ) {
		return docsExample.props.asyncName;
	}

	if ( ! docsExample.type || ( ! docsExample.type.displayName && ! docsExample.type.name ) ) {
		return console.trace( 'Component must be defined' );
	}

	return ( docsExample.type.displayName || docsExample.type.name ).replace( /Example$/, '' );
};

const slugToCamelCase = ( name ) => {
	if ( ! name ) {
		log( 'name is not defined' );
		return console.trace();
	}

	return name
		.replace( /-([a-z])/g, ( s ) => s[ 1 ].toUpperCase() )
		.replace( /^\w/, ( s ) => s.toUpperCase() );
};

const camelCaseToSlug = ( name ) => {
	if ( ! name ) {
		log( 'name is not defined' );
		return console.trace();
	}

	return name.replace( /\.?([A-Z])/g, ( x, y ) => '-' + y.toLowerCase() ).replace( /^-/, '' );
};

export { getComponentName, slugToCamelCase, camelCaseToSlug };
