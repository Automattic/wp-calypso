const fs = require( 'fs' );
const path = require( 'path' );
const { globSync } = require( 'glob' );
const processFiles = require( '../process-files' );
const concatPot = require( '../utils/concat-pot' );

const runExtraction = ( filepaths, dir, baseDir, jobs ) =>
	processFiles( filepaths, { dir, base: baseDir, jobs } );

describe( 'makePot', () => {
	const potOutputDir = path.join( __dirname, 'output/' );
	const parallelPotOutputDir = path.join( __dirname, 'parallel-output/' );
	const baseDir = path.resolve( __dirname, '..' );
	const concatenatedPotOutputPath = path.join(
		potOutputDir,
		'payload',
		'concatenated-strings.pot'
	);
	const parallelConcatenatedPotOutputPath = path.join(
		parallelPotOutputDir,
		'payload',
		'concatenated-strings.pot'
	);

	beforeAll( async () => {
		const examplesGlob = path.join( __dirname, 'examples', '*.{js,jsx,ts,tsx}' );
		const examplesPaths = globSync( examplesGlob ).sort();

		fs.mkdirSync( path.join( potOutputDir, 'payload' ), { recursive: true } );
		fs.mkdirSync( path.join( parallelPotOutputDir, 'payload' ), { recursive: true } );

		await runExtraction( examplesPaths, potOutputDir, baseDir, 1 );
		await runExtraction( examplesPaths, parallelPotOutputDir, baseDir, 2 );

		concatPot( potOutputDir, concatenatedPotOutputPath );
		concatPot( parallelPotOutputDir, parallelConcatenatedPotOutputPath );
	} );

	afterAll( () => {
		fs.rmSync( potOutputDir, { recursive: true, force: true } );
		fs.rmSync( parallelPotOutputDir, { recursive: true, force: true } );
	} );

	test( 'pot files should match their snapshots', () => {
		const potGlob = path.join( potOutputDir, '**', '*.pot' );
		const potPaths = globSync( potGlob )
			.filter( ( filepath ) => filepath !== concatenatedPotOutputPath )
			.map( ( filepath ) => path.relative( __dirname, filepath ) )
			.sort();

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

	test( 'parallel extraction should match serial concatenated output', () => {
		const serialPotFileContent = fs.readFileSync( concatenatedPotOutputPath, 'utf-8' );
		const parallelPotFileContent = fs.readFileSync( parallelConcatenatedPotOutputPath, 'utf-8' );

		expect( parallelPotFileContent ).toEqual( serialPotFileContent );
	} );

	test( 'concatenated pot should only contain allowed strings when line filter is provided', () => {
		const filterExamplesLines = path.join( __dirname, 'examples', 'filter-lines.json' );
		const filterPotOutputPath = path.join( potOutputDir, 'payload', 'filtered-strings.pot' );

		concatPot( potOutputDir, filterPotOutputPath, filterExamplesLines );

		// Test combined POT file snapshot.
		const potFileContent = fs.readFileSync( filterPotOutputPath, 'utf-8' );
		expect( potFileContent ).toMatchSnapshot();
	} );
} );
