/* eslint-disable import/no-nodejs-modules */
/**
 * External dependencies
 */
import { exec } from 'child_process';
import { join } from 'path';
import { readFile } from 'fs';

describe( 'jetpack-blocks-build', () => {
	test(
		'builds-as-expected',
		() =>
			new Promise( ( resolve, reject ) => {
				exec(
					`NODE_ENV='development' SOURCEMAP='none' node ${ join(
						__dirname,
						'..',
						'bin',
						'build.js'
					) } --test-build`,
					buildError => {
						if ( buildError ) {
							return reject( buildError );
						}
						readFile(
							join( __dirname, '..', 'dist', 'test.js' ),
							'utf8',
							( readError, contents ) => {
								if ( readError ) {
									return reject( readError );
								}
								expect( contents ).toMatchSnapshot();
								resolve();
							}
						);
					}
				);
			} ),
		30000
	);
} );
