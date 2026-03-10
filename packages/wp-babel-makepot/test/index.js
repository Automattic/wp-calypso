const fs = require( 'fs' );
const path = require( 'path' );
const glob = require( 'glob' );
const rimraf = require( 'rimraf' );
const makePot = require( '..' );
const cleanupPot = require( '../utils/cleanup-pot' );
const concatPot = require( '../utils/concat-pot' );

describe( 'makePot', () => {
	const potOutputDir = path.join( __dirname, 'output/' );
	const baseDir = path.resolve( __dirname, '..' );
	const concatenatedPotOutputPath = path.join(
		potOutputDir,
		'payload',
		'concatenated-strings.pot'
	);

	beforeAll( () => {
		const examplesGlob = path.join( __dirname, 'examples', '*.{js,jsx,ts,tsx}' );
		const examplesPaths = glob.sync( examplesGlob );

		fs.mkdirSync( path.join( potOutputDir, 'payload' ), { recursive: true } );

		examplesPaths.forEach( ( filepath ) => {
			const preset = filepath.includes( 'decorators' ) ? 'decorators' : 'default';
			makePot( filepath, { preset, dir: potOutputDir, base: baseDir } );
		} );

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

	test( 'concatenated pot should only contain allowed strings when line filter is provided', () => {
		const filterExamplesLines = path.join( __dirname, 'examples', 'filter-lines.json' );
		const filterPotOutputPath = path.join( potOutputDir, 'payload', 'filtered-strings.pot' );

		concatPot( potOutputDir, filterPotOutputPath, filterExamplesLines );

		// Test combined POT file snapshot.
		const potFileContent = fs.readFileSync( filterPotOutputPath, 'utf-8' );
		expect( potFileContent ).toMatchSnapshot();
	} );

	test( 'cleanup should remove intermediate pot files but preserve output inside the same directory', () => {
		const cleanOutputDir = path.join( potOutputDir, 'clean' );
		const cleanOutputPath = path.join( cleanOutputDir, 'bundle-strings.pot' );
		const examplesGlob = path.join( __dirname, 'examples', '*.{js,jsx,ts,tsx}' );
		const examplesPaths = glob.sync( examplesGlob );

		fs.mkdirSync( cleanOutputDir, { recursive: true } );

		examplesPaths.forEach( ( filepath ) => {
			const preset = filepath.includes( 'decorators' ) ? 'decorators' : 'default';
			makePot( filepath, { preset, dir: cleanOutputDir, base: baseDir } );
		} );

		concatPot( cleanOutputDir, cleanOutputPath );
		cleanupPot( cleanOutputDir, cleanOutputPath );

		const remainingPotPaths = glob
			.sync( path.join( cleanOutputDir, '*.pot' ) )
			.map( ( filepath ) => path.basename( filepath ) );

		expect( remainingPotPaths ).toEqual( [ 'bundle-strings.pot' ] );
		expect( fs.existsSync( cleanOutputPath ) ).toBe( true );
	} );
} );
