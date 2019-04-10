/**
 * External dependencies
 */
const { ExternalsPlugin } = require( 'webpack' );
const { RawSource } = require( 'webpack-sources' );
const { createHash } = require( 'crypto' );

const WORDPRESS_NAMESPACE = '@wordpress/';

class WordPressExternalDependenciesPlugin {
	constructor() {
		this.externalizedDeps = new Set();
		this.externalsPlugin = new ExternalsPlugin( 'global', [ this.externalizeWpDeps.bind( this ) ] );
	}

	externalizeWpDeps( context, request, callback ) {
		let externRootRequest;

		switch ( request ) {
			case 'lodash':
			case 'moment':
				externRootRequest = request;
				break;

			case 'jquery':
				externRootRequest = 'jQuery';
				break;

			case 'react':
				externRootRequest = 'React';
				break;
			case 'react-dom':
				externRootRequest = 'ReactDOM';
				break;

			default:
				if ( request.startsWith( WORDPRESS_NAMESPACE ) ) {
					// @wordpress/api-fetch -> wp.apiFetch
					// @wordpress/i18n -> wp.i18n
					externRootRequest = `wp.${ camelCaseDash(
						request.substring( WORDPRESS_NAMESPACE.length )
					) }`;
				}
				break;
		}

		if ( externRootRequest ) {
			this.externalizedDeps.add( request );
			return callback( null, `root ${ externRootRequest }` );
		}

		return callback();
	}

	apply( compiler ) {
		this.externalsPlugin.apply( compiler );

		const { output } = compiler.options;
		const { filename: outputFilename } = output;

		compiler.hooks.emit.tap( this.constructor.name, compilation => {
			// Each entrypoint will get a .deps.json file
			for ( const [ entrypointName, entrypoint ] of compilation.entrypoints.entries() ) {
				const entrypointExternalizedWpDeps = new Set();

				// Search for externalized dependencies in all modules in all entrypoint chunks
				for ( const c of entrypoint.chunks ) {
					for ( const { userRequest } of c.modulesIterable ) {
						if ( this.externalizedDeps.has( userRequest ) ) {
							// Transform @wordpress deps:
							//   @wordpress/i18n -> wp-i18n
							//   @wordpress/escape-html -> wp-escape-html
							// Pass other externalized deps as they are
							entrypointExternalizedWpDeps.add(
								userRequest.startsWith( WORDPRESS_NAMESPACE )
									? 'wp-' + userRequest.substring( WORDPRESS_NAMESPACE.length )
									: userRequest
							);
						}
					}
				}

				// Build a stable JSON string that declares the WordPress script dependencies.
				const sortedDepsArray = Array.from( entrypointExternalizedWpDeps ).sort();
				const depsString = JSON.stringify( sortedDepsArray );

				// Determine a name for the `[entrypoint].deps.json` file.
				const [ filename, query ] = entrypointName.split( '?', 2 );
				const depsFile = compilation.getPath( outputFilename.replace( /\.js$/i, '.deps.json' ), {
					chunk: entrypoint.getRuntimeChunk(),
					filename,
					query,
					basename: basename( filename ),
					contentHash: createHash( 'md4' )
						.update( depsString )
						.digest( 'hex' ),
				} );

				// Inject source/file into the compilation for webpack to output.
				compilation.assets[ depsFile ] = new RawSource( depsString );
				entrypoint.getRuntimeChunk().files.push( depsFile );
			}
		} );
	}
}

/**
 * Given a string, returns a new string with dash separators converted to
 * camelCase equivalent. This is not as aggressive as `_.camelCase` in
 * converting to uppercase, where Lodash will also capitalize letters
 * following numbers.
 *
 * From @wordpress/scripts@3.1.0
 * Duplicated here to avoid depending on @wordpress/scripts with bloated dependencies.
 *
 * @param {string} string Input dash-delimited string.
 *
 * @return {string} Camel-cased string.
 */
function camelCaseDash( string ) {
	return string.replace( /-([a-z])/g, ( match, letter ) => letter.toUpperCase() );
}

function basename( name ) {
	if ( ! name.includes( '/' ) ) {
		return name;
	}
	return name.substr( name.lastIndexOf( '/' ) + 1 );
}

module.exports = WordPressExternalDependenciesPlugin;
