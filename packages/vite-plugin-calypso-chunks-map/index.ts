import fs from 'fs';
import path from 'path';
import type { Plugin } from 'vite';

interface Options {
	output: string;
	baseDir: string;
}

/**
 * Webpack's GenerateChunksMapPlugin emits public/chunks-map.json with the shape:
 *
 *   { "chunk-file.js": [ "client/path/to/module.tsx", ... ], ... }
 *
 * bin/build-languages.js consumes it to map i18n strings (referenced in module
 * source paths) to the chunk that includes them, then emits per-chunk
 * translation files. This plugin replicates the same output from Rollup's
 * bundle so the language build step works under Vite.
 */
export function viteBuildChunksMap( { output, baseDir }: Options ): Plugin {
	return {
		name: 'calypso-chunks-map',
		apply: 'build',

		generateBundle( _outputOptions, bundle ) {
			const chunksMap: Record< string, string[] > = {};

			for ( const [ fileName, asset ] of Object.entries( bundle ) ) {
				if ( asset.type !== 'chunk' ) {
					continue;
				}
				if ( ! fileName.endsWith( '.js' ) ) {
					continue;
				}

				const modules = Object.keys( asset.modules )
					.map( ( id ) => {
						// Strip Rollup query suffixes (`?used`, `?direct`, etc.) and virtual prefixes.
						const cleanId = id.split( '?' )[ 0 ];
						if ( cleanId.startsWith( '\0' ) ) {
							return null;
						}
						if ( ! path.isAbsolute( cleanId ) ) {
							return null;
						}
						const rel = path.relative( baseDir, cleanId );
						if ( ! rel || rel.startsWith( '..' ) ) {
							return null;
						}
						return rel;
					} )
					.filter( ( m ): m is string => !! m );

				chunksMap[ fileName ] = modules;
			}

			fs.mkdirSync( path.dirname( output ), { recursive: true } );
			fs.writeFileSync( output, JSON.stringify( chunksMap ) );
			this.info( `chunks-map: wrote ${ output }` );
		},
	};
}
