const { resolveSigner, buildSignToolArgs } = require( '../../bin/windows-signing-core' );

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
