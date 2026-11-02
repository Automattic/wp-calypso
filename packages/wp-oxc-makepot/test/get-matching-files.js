const fs = require( 'fs' );
const os = require( 'os' );
const path = require( 'path' );
const getMatchingFiles = require( '../utils/get-matching-files' );

describe( 'getMatchingFiles', () => {
	const initialCwd = process.cwd();
	let root;

	beforeAll( () => {
		// A `test` folder above the checkout must not match the `**/test/**` ignore.
		root = path.join(
			fs.realpathSync( fs.mkdtempSync( path.join( os.tmpdir(), 'oxc-' ) ) ),
			'test'
		);
		fs.mkdirSync( path.join( root, 'app' ), { recursive: true } );
		fs.mkdirSync( path.join( root, 'src', 'test' ), { recursive: true } );
		fs.writeFileSync( path.join( root, 'src', 'kept.js' ), '' );
		fs.writeFileSync( path.join( root, 'src', 'test', 'dropped.js' ), '' );
		process.chdir( path.join( root, 'app' ) );
	} );

	afterAll( () => {
		process.chdir( initialCwd );
		fs.rmSync( path.dirname( root ), { recursive: true, force: true } );
	} );

	// Apps run makepot from `apps/<app>` on `../../client/**`; their `**/test/**` ignores matched nothing there.
	it( 'applies ignore patterns to files in a sibling of cwd', () => {
		expect( getMatchingFiles( [ '../src/**/*.js' ], [ '**/test/**' ] ) ).toEqual( [
			path.join( root, 'src', 'kept.js' ),
		] );
	} );
} );
