/** @format */
/**
 * Replaces import paths using implicit top-level
 * directory structure with explicit import paths
 *
 * @example
 * // input
 * import Something from 'components/something'
 *
 * // output
 * import Something from 'client/components/something'
 */

const chalk = require( 'chalk' );
const fs = require( 'fs' );
const path = require( 'path' );
const config = require( './config' );

const underRoot = base => module =>
	[ '', '.js', '.jsx' ].reduce( ( hasIt, suffix ) => {
		if ( hasIt ) {
			return hasIt;
		}

		try {
			fs.accessSync( path.join( __dirname, `../../../${ base }/`, module + suffix ) );
			return true;
		} catch ( e ) {
			return false;
		}
	}, false );

export default function transformer( file, api ) {
	const j = api.jscodeshift;

	const inClient = underRoot( 'client' );
	const inExtensions = underRoot( 'client/extensions' );
	const baseFor = module => {
		if ( inClient( module ) ) {
			return 'client';
		}

		if ( inExtensions( module ) ) {
			return 'client/extensions';
		}

		return null;
	};

	return j( file.source )
		.find( j.ImportDeclaration )
		.filter( dec => {
			const path = dec.value.source.value;

			if ( 'config' === path ) {
				return false;
			}

			const isRelative = path.startsWith( '.' );
			const isClient = inClient( path ) || inExtensions( path );

			if ( ! isRelative && ! isClient ) {
				console.log( chalk.yellow( `Not in client: ${ path }` ) );
			}

			return ! isRelative && isClient;
		} )
		.replaceWith( node => {
			const module = node.value.source.value;
			const base = baseFor( module );

			return Object.assign(
				j.importDeclaration( node.value.specifiers, j.literal( `${ base }/${ module }` ) ),
				{
					comments: node.value.comments,
				}
			);
		} )
		.toSource( config.recastOptions );
}
