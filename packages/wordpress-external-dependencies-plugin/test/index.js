const webpack = require( 'webpack' );
const WordPressExternalDependenciesPlugin = require( '..' );
const { join } = require( 'path' );
const { readFile } = require( 'fs' );
const rimraf = require( 'rimraf' ).sync;

beforeEach( () => {
	rimraf( join( __dirname, 'result' ) );
} );
afterAll( () => {
	rimraf( join( __dirname, 'result' ) );
} );

describe( 'wordpress-external-dependencies-plugin', () => {
	test(
		'produces no output when no relevant deps are found',
		() =>
			new Promise( ( resolve, reject ) =>
				webpack(
					{
						entry: {
							'no-deps': join( __dirname, 'test-source', 'no-deps' ),
						},
						output: {
							path: join( __dirname, 'result' ),
						},
						plugins: [ new WordPressExternalDependenciesPlugin() ],
					},
					webpackErr => {
						if ( webpackErr ) {
							reject( webpackErr );
						}
						readFile( join( __dirname, 'result', 'no-deps.js' ), ( readErr, contents ) => {
							if ( readErr ) {
								reject( readErr );
							}
							expect( contents ).toMatchSnapshot();
							resolve();
						} );
					}
				)
			),
		10000
	);
} );
