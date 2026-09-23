/**
 * @jest-environment jsdom
 */

const mockShouldLoadSurvicate = jest.fn();
const mockLoadSurvicateScript = jest.fn();
const mockSetSurvicateVisitorTraits = jest.fn();

jest.mock( '@automattic/survicate', () => ( {
	SURVICATE_WORKSPACE_ID: 'workspace-id',
	shouldLoadSurvicate: mockShouldLoadSurvicate,
	loadSurvicateScript: mockLoadSurvicateScript,
	setSurvicateVisitorTraits: mockSetSurvicateVisitorTraits,
} ) );

const CONFIG = {
	locale: 'en_US',
	traits: {
		email: 'user@example.com',
		site_id: '123',
		site_type: 'simple',
		editor_context: 'wp-admin',
		is_big_sky_site: 'false',
	},
};

function setViewportWidth( width ) {
	Object.defineProperty( window, 'innerWidth', {
		value: width,
		configurable: true,
		writable: true,
	} );
}

// The entry runs on import, so each test re-imports it in isolation.
function boot( config ) {
	if ( config === undefined ) {
		delete window.wpcomSurvicateConfig;
	} else {
		window.wpcomSurvicateConfig = config;
	}
	jest.isolateModules( () => {
		require( '../survicate' );
	} );
}

const flushPromises = () => new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

describe( 'wp-admin Survicate entry', () => {
	beforeEach( () => {
		mockShouldLoadSurvicate.mockReset().mockReturnValue( true );
		mockLoadSurvicateScript.mockReset().mockResolvedValue( undefined );
		mockSetSurvicateVisitorTraits.mockReset();
		setViewportWidth( 1024 );
	} );

	afterEach( () => {
		delete window.wpcomSurvicateConfig;
	} );

	it( 'does nothing when PHP emitted no config', () => {
		boot( undefined );

		expect( mockShouldLoadSurvicate ).not.toHaveBeenCalled();
		expect( mockLoadSurvicateScript ).not.toHaveBeenCalled();
	} );

	it( 'gates on the locale PHP sent and a desktop viewport', () => {
		boot( CONFIG );

		expect( mockShouldLoadSurvicate ).toHaveBeenCalledWith( { locale: 'en_US', isMobile: false } );
	} );

	it.each( [ 479, 480 ] )( 'treats a %ipx viewport as mobile', ( width ) => {
		setViewportWidth( width );

		boot( CONFIG );

		expect( mockShouldLoadSurvicate ).toHaveBeenCalledWith( { locale: 'en_US', isMobile: true } );
	} );

	it( 'treats a 481px viewport as desktop', () => {
		setViewportWidth( 481 );

		boot( CONFIG );

		expect( mockShouldLoadSurvicate ).toHaveBeenCalledWith( { locale: 'en_US', isMobile: false } );
	} );

	it( 'does not load the SDK when the load gate says no', () => {
		mockShouldLoadSurvicate.mockReturnValue( false );

		boot( CONFIG );

		expect( mockLoadSurvicateScript ).not.toHaveBeenCalled();
	} );

	it( 'loads the SDK for the shared workspace and pushes the PHP traits', async () => {
		boot( CONFIG );
		await flushPromises();

		expect( mockLoadSurvicateScript ).toHaveBeenCalledWith( 'workspace-id' );
		expect( mockSetSurvicateVisitorTraits ).toHaveBeenCalledWith( CONFIG.traits );
	} );

	it( 'swallows an SDK load failure', async () => {
		const onUnhandledRejection = jest.fn();
		process.on( 'unhandledRejection', onUnhandledRejection );
		mockLoadSurvicateScript.mockRejectedValue( new Error( 'blocked' ) );

		try {
			expect( () => boot( CONFIG ) ).not.toThrow();
			await flushPromises();

			expect( onUnhandledRejection ).not.toHaveBeenCalled();
			expect( mockSetSurvicateVisitorTraits ).not.toHaveBeenCalled();
		} finally {
			process.off( 'unhandledRejection', onUnhandledRejection );
		}
	} );
} );
