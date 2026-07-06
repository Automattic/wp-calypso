const { resolveSigner, buildSignToolArgs } = require( '../../bin/windows-signing-core' );

const AZURE_ENV = {
	AZURE_CODE_SIGNING_DLIB: 'C:\\dlib\\Azure.CodeSigning.Dlib.dll',
	AZURE_METADATA_JSON: 'C:\\meta\\metadata.json',
	SIGNTOOL_PATH: 'C:\\sdk\\signtool.exe',
};

describe( 'resolveSigner', () => {
	it( 'selects Azure when its env is present', () => {
		expect( resolveSigner( AZURE_ENV ) ).toMatchObject( {
			kind: 'azure',
			dlib: AZURE_ENV.AZURE_CODE_SIGNING_DLIB,
		} );
	} );

	it( 'throws naming the missing var for a partial Azure config', () => {
		const { SIGNTOOL_PATH, ...partial } = AZURE_ENV;
		expect( () => resolveSigner( partial ) ).toThrow( /SIGNTOOL_PATH/ );
	} );

	it( 'throws when no signing config is present', () => {
		expect( () => resolveSigner( {} ) ).toThrow( /Azure Artifact Signing missing/ );
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
} );

describe( 'win.sign callback', () => {
	const originalCI = process.env.CI;
	afterEach( () => {
		if ( originalCI === undefined ) {
			delete process.env.CI;
		} else {
			process.env.CI = originalCI;
		}
		jest.dontMock( '../../bin/windows-signing-core' );
	} );

	function loadSignWithMockedCore() {
		jest.resetModules();
		jest.doMock( '../../bin/windows-signing-core', () => ( {
			resolveSigner: jest.fn(),
			signFile: jest.fn(),
		} ) );
		return {
			core: require( '../../bin/windows-signing-core' ),
			sign: require( '../../bin/windows-sign' ),
		};
	}

	it( 'skips the SHA1 pass without signing', async () => {
		process.env.CI = 'true';
		const { core, sign } = loadSignWithMockedCore();
		await sign( { path: 'app.exe', hash: 'sha1' } );
		expect( core.signFile ).not.toHaveBeenCalled();
	} );

	it( 'skips signing off CI, without resolving a signer', async () => {
		delete process.env.CI;
		const { core, sign } = loadSignWithMockedCore();
		await sign( { path: 'app.exe', hash: 'sha256' } );
		expect( core.resolveSigner ).not.toHaveBeenCalled();
		expect( core.signFile ).not.toHaveBeenCalled();
	} );

	it( 'signs the SHA256 pass on CI', async () => {
		process.env.CI = 'true';
		const { core, sign } = loadSignWithMockedCore();
		await sign( { path: 'app.exe', hash: 'sha256' } );
		expect( core.signFile ).toHaveBeenCalledWith( undefined, 'app.exe' );
	} );
} );
