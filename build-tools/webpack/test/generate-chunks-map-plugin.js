import fs from 'fs';
import os from 'os';
import path from 'path';
import GenerateChunksMapPlugin from '../generate-chunks-map-plugin';

describe( 'GenerateChunksMapPlugin', () => {
	test( 'writes ordered module paths to a new directory, skipping chunks without JavaScript', () => {
		const tempDir = fs.mkdtempSync( path.join( os.tmpdir(), 'chunks-map-' ) );
		const output = path.join( tempDir, 'dist', 'chunks-map.json' );
		let doneCallback;

		const compiler = {
			hooks: {
				done: {
					tap: ( _name, callback ) => {
						doneCallback = callback;
					},
				},
			},
		};

		try {
			new GenerateChunksMapPlugin( { output, base_dir: tempDir } ).apply( compiler );

			doneCallback( {
				compilation: {
					chunks: [
						{
							files: new Set( [ 'build.min.js' ] ),
						},
						{
							files: new Set( [ 'style.css' ] ),
						},
					],
					chunkGraph: {
						getChunkModulesIterable: () => [
							{
								userRequest: path.join( tempDir, 'src', 'app.js' ),
							},
							{
								modules: [
									{ userRequest: path.join( tempDir, 'src', 'first.js' ) },
									{ userRequest: path.join( tempDir, 'src', 'second.js' ) },
								],
							},
							{ modules: [] },
							{},
							{ userRequest: '' },
							{ userRequest: path.join( tempDir, 'src', 'app.js' ) },
						],
					},
				},
			} );

			expect( JSON.parse( fs.readFileSync( output, 'utf8' ) ) ).toEqual( {
				'build.min.js': [ 'src/app.js', 'src/first.js', 'src/second.js', 'src/app.js' ],
			} );
		} finally {
			fs.rmSync( tempDir, { recursive: true, force: true } );
		}
	} );
} );
