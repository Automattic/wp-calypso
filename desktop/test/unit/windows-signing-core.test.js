const fs = require( 'fs' );
const os = require( 'os' );
const path = require( 'path' );
const {
	resolveSigner,
	buildSignToolArgs,
	collectSignableBinaries,
} = require( '../../bin/windows-signing-core' );

const AZURE_ENV = {
	AZURE_CODE_SIGNING_DLIB: 'C:\\dlib\\Azure.CodeSigning.Dlib.dll',
	AZURE_METADATA_JSON: 'C:\\meta\\metadata.json',
	SIGNTOOL_PATH: 'C:\\sdk\\signtool.exe',
};

const PFX_ENV = {
	WIN_CSC_LINK: 'C:\\certs\\certificate.pfx',
	WIN_CSC_KEY_PASSWORD: 'hunter2',
	SIGNTOOL_PATH: 'C:\\sdk\\signtool.exe',
};

describe( 'resolveSigner', () => {
	it( 'selects Azure when its env is present', () => {
		expect( resolveSigner( AZURE_ENV ) ).toMatchObject( {
			kind: 'azure',
			dlib: AZURE_ENV.AZURE_CODE_SIGNING_DLIB,
		} );
	} );

	it( 'falls back to PFX when only PFX env is present', () => {
		expect( resolveSigner( PFX_ENV ) ).toMatchObject( { kind: 'pfx', pfx: PFX_ENV.WIN_CSC_LINK } );
	} );

	it( 'prefers Azure over PFX when both are present', () => {
		expect( resolveSigner( { ...AZURE_ENV, ...PFX_ENV } ).kind ).toBe( 'azure' );
	} );

	it( 'throws naming the missing var for a partial Azure config', () => {
		const { SIGNTOOL_PATH, ...partial } = AZURE_ENV;
		expect( () => resolveSigner( partial ) ).toThrow( /SIGNTOOL_PATH/ );
	} );

	it( 'throws naming the missing var for a partial PFX config', () => {
		const { WIN_CSC_KEY_PASSWORD, ...partial } = PFX_ENV;
		expect( () => resolveSigner( partial ) ).toThrow( /WIN_CSC_KEY_PASSWORD/ );
	} );

	it( 'throws when no signing config is present', () => {
		expect( () => resolveSigner( {} ) ).toThrow( /No Windows signing configuration/ );
	} );
} );

describe( 'buildSignToolArgs', () => {
	it( 'builds an Azure dlib invocation, SHA256, file last', () => {
		const args = buildSignToolArgs( resolveSigner( AZURE_ENV ), 'app.exe' );
		expect( args ).toEqual(
			expect.arrayContaining( [
				'/dlib',
				AZURE_ENV.AZURE_CODE_SIGNING_DLIB,
				'/dmdf',
				AZURE_ENV.AZURE_METADATA_JSON,
			] )
		);
		expect( args ).not.toContain( '/f' );
		expect( args[ args.length - 1 ] ).toBe( 'app.exe' );
		expect( args ).toEqual( expect.arrayContaining( [ '/fd', 'SHA256' ] ) );
	} );

	it( 'builds a PFX invocation with cert + password, file last', () => {
		const args = buildSignToolArgs( resolveSigner( PFX_ENV ), 'app.exe' );
		expect( args ).toEqual(
			expect.arrayContaining( [ '/f', PFX_ENV.WIN_CSC_LINK, '/p', PFX_ENV.WIN_CSC_KEY_PASSWORD ] )
		);
		expect( args ).not.toContain( '/dlib' );
		expect( args[ args.length - 1 ] ).toBe( 'app.exe' );
	} );
} );

describe( 'collectSignableBinaries', () => {
	let root;

	beforeEach( () => {
		root = fs.mkdtempSync( path.join( os.tmpdir(), 'sign-collect-' ) );
	} );

	afterEach( () => {
		fs.rmSync( root, { recursive: true, force: true } );
	} );

	it( 'signs *.node/*.dll at any depth and *.exe only below the top level', () => {
		// electron-builder signs the top-level app exe itself, so afterPack must skip it.
		fs.writeFileSync( path.join( root, 'WordPress.com.exe' ), '' );
		fs.writeFileSync( path.join( root, 'ffmpeg.dll' ), '' );
		fs.writeFileSync( path.join( root, 'app.txt' ), '' );
		const nested = path.join( root, 'resources', 'app', 'node_modules', 'pkg' );
		fs.mkdirSync( nested, { recursive: true } );
		fs.writeFileSync( path.join( nested, 'helper.exe' ), '' );
		fs.writeFileSync( path.join( nested, 'binding.node' ), '' );
		fs.writeFileSync( path.join( nested, 'readme.md' ), '' );

		const found = collectSignableBinaries( root )
			.map( ( f ) => path.relative( root, f ) )
			.sort();

		expect( found ).toEqual(
			[
				'ffmpeg.dll',
				path.join( 'resources', 'app', 'node_modules', 'pkg', 'binding.node' ),
				path.join( 'resources', 'app', 'node_modules', 'pkg', 'helper.exe' ),
			].sort()
		);
		expect( found ).not.toContain( 'WordPress.com.exe' );
	} );

	it( 'skips symlinks', () => {
		const nested = path.join( root, 'resources' );
		fs.mkdirSync( nested );
		fs.writeFileSync( path.join( nested, 'real.exe' ), '' );
		fs.symlinkSync( path.join( nested, 'real.exe' ), path.join( nested, 'link.exe' ) );

		const found = collectSignableBinaries( root ).map( ( f ) => path.basename( f ) );

		expect( found ).toEqual( [ 'real.exe' ] );
	} );
} );

describe( 'win.sign callback', () => {
	it( 'skips the SHA1 pass without signing', async () => {
		jest.resetModules();
		jest.doMock( '../../bin/windows-signing-core', () => ( {
			resolveSigner: jest.fn(),
			signFile: jest.fn(),
		} ) );
		const core = require( '../../bin/windows-signing-core' );
		const sign = require( '../../bin/windows-sign' );
		await sign( { path: 'app.exe', hash: 'sha1' } );
		expect( core.signFile ).not.toHaveBeenCalled();
		jest.dontMock( '../../bin/windows-signing-core' );
	} );
} );
