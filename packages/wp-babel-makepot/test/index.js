/**
 * External dependencies
 */
const fs = require( 'fs' );
const glob = require( 'glob' );
const path = require( 'path' );
const rimraf = require( 'rimraf' );

/**
 * Internal dependencies
 */
const makePot = require( '..' );
const concatPot = require( '../utils/concat-pot' );

describe( 'makePot', () => {
	const potOutputDir = path.join( __dirname, 'output/' );
	const baseDir = path.resolve( __dirname, '..' );
	const concatenatedPotOutputPath = path.join( potOutputDir, 'concatenated-strings.pot' );

	beforeAll( () => {
		const examplesGlob = path.join( __dirname, 'examples', '*.{js,jsx,ts,tsx}' );
		const examplesPaths = glob.sync( examplesGlob );

		examplesPaths.forEach( ( filepath ) =>
			makePot( filepath, { dir: potOutputDir, base: baseDir } )
		);

		concatPot( potOutputDir, concatenatedPotOutputPath );
	} );

	afterAll( () => {
		rimraf.sync( potOutputDir );
	} );

	test( 'pot files should match their snapshots', () => {
		const potGlob = path.join( __dirname, '**', '*.pot' );
		const potPaths = glob
			.sync( potGlob )
			.filter( ( filepath ) => filepath !== concatenatedPotOutputPath )
			.map( ( filepath ) => path.relative( __dirname, filepath ) );

		// Test if the array of POT file paths has changed.
		expect( potPaths ).toMatchSnapshot();

		// Test individual POT files snapshots.
		potPaths.forEach( ( potPath ) => {
			const potFileContent = fs.readFileSync( path.resolve( __dirname, potPath ), 'utf-8' );
			expect( potFileContent ).toMatchSnapshot();
		} );
	} );

	test( 'concatenated pot should match its snapshot', () => {
		// Test combined POT file snapshot.
		const potFileContent = fs.readFileSync( concatenatedPotOutputPath, 'utf-8' );
		expect( potFileContent ).toMatchSnapshot();
	} );
} );
