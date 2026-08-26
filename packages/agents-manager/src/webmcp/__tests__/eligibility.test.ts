import {
	canExposeWebMcpTools,
	getWebMcpModelContext,
	isWebMcpExperimentEnabled,
} from '../eligibility';

describe( 'WebMCP eligibility', () => {
	beforeEach( () => {
		document.body.className = 'site-editor-php';
		window.history.replaceState( {}, '', '/' );
		Object.defineProperty( document, 'modelContext', { configurable: true, value: undefined } );
		Object.defineProperty( navigator, 'modelContext', { configurable: true, value: undefined } );
	} );

	it( 'is default-off and requires the exact query opt-in', () => {
		expect( isWebMcpExperimentEnabled( '' ) ).toBe( false );
		expect( isWebMcpExperimentEnabled( '?webmcp=0' ) ).toBe( false );
		expect( isWebMcpExperimentEnabled( '?webmcp=1' ) ).toBe( true );
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
		window.history.replaceState( {}, '', '/?webmcp=1' );
		expect( canExposeWebMcpTools() ).toBe( false );
	} );

	it( 'is a no-op on non-editor routes', () => {
		window.history.replaceState( {}, '', '/?webmcp=1' );
		document.body.className = 'wp-admin';
		Object.defineProperty( document, 'modelContext', {
			configurable: true,
			value: { registerTool: jest.fn() },
		} );
		expect( canExposeWebMcpTools() ).toBe( false );
	} );

	it( 'qualifies only when enabled in a supported editor and browser', () => {
		window.history.replaceState( {}, '', '/?webmcp=1' );
		Object.defineProperty( document, 'modelContext', {
			configurable: true,
			value: { registerTool: jest.fn() },
		} );
		expect( canExposeWebMcpTools() ).toBe( true );
	} );
} );
