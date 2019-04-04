/**
 * External dependencies
 */
const { ExternalsPlugin } = require( 'webpack' );
const { RawSource } = require( 'webpack-sources' );
const { camelCaseDash } = require( '@wordpress/scripts/utils' );
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
		const { /*path: outputPath,*/ filename: outputFilename } = output;

		compiler.hooks.emit.tap( this.constructor.name, compilation => {
			// const stats = compilation.getStats();
			for ( const [ entrypointName, entrypoint ] of compilation.entrypoints.entries() ) {
				const entrypointExternalizedWpDeps = new Set();

				for ( const c of entrypoint.chunks ) {
					for ( const chunkModule of c.modulesIterable ) {
						const { userRequest } = chunkModule;

						if ( this.externalizedDeps.has( userRequest ) ) {
							// Pass externalized deps
							// Transform @wordpress deps:
							//   @wordpress/i18n -> wp-i18n
							//   @wordpress/escape-html -> wp-escape-html
							entrypointExternalizedWpDeps.add(
								userRequest.startsWith( WORDPRESS_NAMESPACE )
									? 'wp-' + userRequest.substring( WORDPRESS_NAMESPACE.length )
									: userRequest
							);
						}
					}
				}

				const depsArray = Array.from( entrypointExternalizedWpDeps );
				depsArray.sort();

				const depsString = JSON.stringify( depsArray );

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

				compilation.assets[ depsFile ] = new RawSource( depsString );
				entrypoint.getRuntimeChunk().files.push( depsFile );
			}
		} );
	}
}

function basename( name ) {
	if ( ! name.includes( '/' ) ) {
		return name;
	}
	return name.substr( name.lastIndexOf( '/' ) + 1 );
}

module.exports = WordPressExternalDependenciesPlugin;
