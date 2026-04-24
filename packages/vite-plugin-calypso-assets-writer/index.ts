import fs from 'fs';
import path from 'path';
import type { Plugin } from 'vite';

interface ManifestChunk {
	file: string;
	css?: string[];
	isEntry?: boolean;
}

interface Options {
	outDir: string;
	buildDir: string;
	publicPath: string;
	entrypoints: Record< string, string >;
}

export function viteBuildAssetsWriter( {
	outDir,
	buildDir,
	publicPath,
	entrypoints,
}: Options ): Plugin {
	return {
		name: 'calypso-assets-writer',
		apply: 'build',

		writeBundle() {
			const manifestPath = path.join( outDir, '.vite', 'manifest.json' );
			if ( ! fs.existsSync( manifestPath ) ) {
				this.warn( 'assets-writer: manifest.json not found, skipping assets.json generation' );
				return;
			}

			const manifest: Record< string, ManifestChunk > = JSON.parse(
				fs.readFileSync( manifestPath, 'utf8' )
			);

			const inputToEntryName = new Map< string, string >();
			for ( const [ entryName, inputPath ] of Object.entries( entrypoints ) ) {
				inputToEntryName.set( inputPath, entryName );
			}

			const assets: Record< string, string[] > = {};

			for ( const [ manifestKey, chunk ] of Object.entries( manifest ) ) {
				if ( ! chunk.isEntry ) {
					continue;
				}

				let entryName: string | null = null;
				for ( const [ inputPath, name ] of inputToEntryName.entries() ) {
					if ( inputPath.endsWith( '/' + manifestKey ) || inputPath === manifestKey ) {
						entryName = name;
						break;
					}
				}

				if ( ! entryName ) {
					continue;
				}

				const files: string[] = [];

				files.push( publicPath + chunk.file );

				for ( const cssFile of chunk.css ?? [] ) {
					files.push( publicPath + cssFile );
				}

				assets[ entryName ] = files;
			}

			const output = {
				manifests: [],
				assets,
			};

			fs.mkdirSync( buildDir, { recursive: true } );
			const outputPath = path.join( buildDir, 'assets.json' );
			fs.writeFileSync( outputPath, JSON.stringify( output, null, '\t' ) );
			this.info( `assets-writer: wrote ${ outputPath }` );
		},
	};
}
