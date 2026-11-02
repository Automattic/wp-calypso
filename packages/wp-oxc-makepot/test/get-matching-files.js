const fs = require( 'fs' );
const os = require( 'os' );
const path = require( 'path' );
const getMatchingFiles = require( '../utils/get-matching-files' );

describe( 'getMatchingFiles', () => {
	const initialCwd = process.cwd();
	let root;

	beforeAll( () => {
		root = fs.realpathSync( fs.mkdtempSync( path.join( os.tmpdir(), 'oxc-makepot-' ) ) );
		fs.mkdirSync( path.join( root, 'app' ) );
		fs.mkdirSync( path.join( root, 'src', 'skipped' ), { recursive: true } );
		fs.writeFileSync( path.join( root, 'src', 'kept.js' ), '' );
		fs.writeFileSync( path.join( root, 'src', 'skipped', 'dropped.js' ), '' );
		process.chdir( path.join( root, 'app' ) );
	} );

	afterAll( () => {
		process.chdir( initialCwd );
		fs.rmSync( root, { recursive: true, force: true } );
	} );

	// Apps run makepot from `apps/<app>` on `../../client/**`; their `**/test/**` ignores matched nothing there.
	it( 'applies `**/` ignore patterns to files in a sibling of cwd', () => {
		expect( getMatchingFiles( [ '../src/**/*.js' ], [ '**/skipped/**' ] ) ).toEqual( [
			path.join( root, 'src', 'kept.js' ),
		] );
	} );
} );
