/**
 * External dependencies.
 */
const fs = require( 'fs' ); //eslint-disable-line import/no-nodejs-modules
const path = require( 'path' );

/**
 * Plugin name.
 *
 * @type {string}
 */
const PLUGIN_NAME = 'GenerateChunksMap';

class GenerateChunksMapPlugin {
	constructor( { output = path.resolve( '.', 'map.json' ) } = {} ) {
		this.output = output;
	}

	apply( compiler ) {
		compiler.hooks.done.tap( PLUGIN_NAME, ( { compilation } ) => {
			// Generate chunks map
			const { chunks } = compilation;

			const chunksMap = chunks.reduce( ( map, chunk ) => {
				const files = chunk.files;
				const name = files.find( file => /\.js$/.test( file ) ) || files[ 0 ];
				const modules = [ ...chunk.modulesIterable ]
					.reduce( ( acc, item ) => acc.concat( item.modules || item ), [] )
					.map( ( { userRequest } ) => userRequest && path.relative( '.', userRequest ) )
					.filter( module => !! module );

				map[ name ] = modules;

				return map;
			}, {} );

			// Write chunks map
			fs.writeFileSync( this.output, JSON.stringify( chunksMap ) );
		} );
	}
}

module.exports = GenerateChunksMapPlugin;
