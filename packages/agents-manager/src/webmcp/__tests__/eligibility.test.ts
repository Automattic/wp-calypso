import {
	canExposeWebMcpTools,
	getWebMcpModelContext,
	isWebMcpExperimentEnabled,
} from '../eligibility';

describe( 'WebMCP eligibility', () => {
	beforeEach( () => {
		document.body.className = 'site-editor-php';
		window.history.replaceState( {}, '', '/' );
		delete ( globalThis as { agentsManagerData?: unknown } ).agentsManagerData;
		Object.defineProperty( document, 'modelContext', { configurable: true, value: undefined } );
		Object.defineProperty( navigator, 'modelContext', { configurable: true, value: undefined } );
	} );

	it( 'is default-off and uses the server-provided development mode', () => {
		expect( isWebMcpExperimentEnabled() ).toBe( false );

		window.history.replaceState( {}, '', '/?webmcp=1' );
		( globalThis as { agentsManagerData?: unknown } ).agentsManagerData = {
			isDevMode: false,
		};
		expect( isWebMcpExperimentEnabled() ).toBe( false );

		window.history.replaceState( {}, '', '/' );
		( globalThis as { agentsManagerData?: unknown } ).agentsManagerData = {
			isDevMode: true,
		};
		expect( isWebMcpExperimentEnabled() ).toBe( true );
	} );

	it( 'prefers document.modelContext and falls back to navigator.modelContext', () => {
		const documentContext = { registerTool: jest.fn() };
		const navigatorContext = { registerTool: jest.fn() };

		expect(
			getWebMcpModelContext( { modelContext: documentContext }, { modelContext: navigatorContext } )
		).toBe( documentContext );
		expect(
			getWebMcpModelContext( { modelContext: undefined }, { modelContext: navigatorContext } )
		).toBe( navigatorContext );
		expect( getWebMcpModelContext( {}, {} ) ).toBeUndefined();
	} );

	it( 'is a no-op in unsupported browsers', () => {
		( globalThis as { agentsManagerData?: unknown } ).agentsManagerData = {
			isDevMode: true,
		};
		expect( canExposeWebMcpTools() ).toBe( false );
	} );

	it( 'is a no-op on non-editor routes', () => {
		( globalThis as { agentsManagerData?: unknown } ).agentsManagerData = {
			isDevMode: true,
		};
		document.body.className = 'wp-admin';
		Object.defineProperty( document, 'modelContext', {
			configurable: true,
			value: { registerTool: jest.fn() },
		} );
		expect( canExposeWebMcpTools() ).toBe( false );
	} );

	it( 'qualifies only when enabled in a supported editor and browser', () => {
		( globalThis as { agentsManagerData?: unknown } ).agentsManagerData = {
			isDevMode: true,
		};
		Object.defineProperty( document, 'modelContext', {
			configurable: true,
			value: { registerTool: jest.fn() },
		} );
		expect( canExposeWebMcpTools() ).toBe( true );
	} );
} );
